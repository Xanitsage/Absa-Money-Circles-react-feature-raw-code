
import { db } from '../../storage';
import { eq } from 'drizzle-orm';
import { users, conversations } from '../../schema';
import { logger } from '../../utils/logger';

interface ProcessedInput {
  intent: string;
  entities: Record<string, any>;
  context: {
    userLevel: number;
    recentAchievements: string[];
    activeGoals: string[];
    suggestedActions: string[];
  };
  confidence: number;
}

const intentPatterns = {
  savings_inquiry: [
    'how much (did|have) I save(d)?',
    'savings? (status|progress|update)',
    'my savings?',
    'saved (this|last) month'
  ],
  circle_status: [
    'circle (status|progress|update)',
    'how is (my|our) circle (doing|going)',
    'circle progress',
    'group savings'
  ],
  financial_education: [
    'explain|tell me about|what is|how (do|does)',
    'learn|teach|understand',
    'difference between',
    'why should I'
  ],
  balance_inquiry: [
    'balance',
    'how much (do I have|is in)',
    'account (status|balance)',
    'available funds'
  ],
  transfer: [
    'send|transfer|pay',
    'payment to',
    'move money',
    'contribute'
  ],
  goal_setting: [
    'set|create|start (a )?(new )?goal',
    'saving for',
    'want to save',
    'target amount'
  ]
};

export async function processUserInput(text: string, userId: string): Promise<ProcessedInput> {
  try {
    // Get user context
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        achievements: {
          limit: 5,
          orderBy: 'createdAt'
        },
        goals: {
          where: eq('status', 'active')
        }
      }
    });

    // Classify intent
    const { intent, confidence } = classifyIntent(text.toLowerCase());

    // Extract entities
    const entities = extractEntities(text);

    // Build context
    const context = {
      userLevel: user?.level || 1,
      recentAchievements: user?.achievements?.map(a => a.type) || [],
      activeGoals: user?.goals?.map(g => g.name) || [],
      suggestedActions: generateSuggestedActions(intent, user)
    };

    return {
      intent,
      entities,
      context,
      confidence
    };

  } catch (error) {
    logger.error('Error processing user input:', error);
    throw new Error('Failed to process user input');
  }
}

function classifyIntent(text: string): { intent: string; confidence: number; subIntents: string[]; complexity: number } {
  let highestConfidence = 0;
  let matchedIntent = 'unknown';
  const subIntents: string[] = [];
  let complexity = 0;

  // Analyze question complexity
  complexity = analyzeComplexity(text);

  // Multi-intent classification
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(text)) {
        const confidence = calculateConfidenceScore(text, pattern);
        if (confidence > 0.4) { // Track multiple relevant intents
          subIntents.push(intent);
          if (confidence > highestConfidence) {
            highestConfidence = confidence;
            matchedIntent = intent;
          }
        }
      }
    }
  }

  // Enhanced intent classification
  return {
    intent: matchedIntent,
    confidence: highestConfidence,
    subIntents: subIntents,
    complexity: complexity
  };
}

function analyzeComplexity(text: string): number {
  const complexityFactors = {
    questionWords: /(why|how|what if|explain|compare|analyze|predict)/gi,
    financialTerms: /(interest rate|investment|portfolio|diversification|risk|market|trend)/gi,
    conditionals: /(if|when|unless|assuming|provided that)/gi,
    numericalAnalysis: /(percentage|ratio|growth|decline|calculate|estimate)/gi
  };

  let complexity = 0;
  for (const [_, regex] of Object.entries(complexityFactors)) {
    const matches = text.match(regex) || [];
    complexity += matches.length * 0.25;
  }

  return Math.min(Math.max(complexity, 0), 1);
}

  return {
    intent: matchedIntent,
    confidence: highestConfidence
  };
}

function calculateConfidenceScore(text: string, pattern: string): number {
  const words = text.split(' ');
  const patternWords = pattern.split('|')[0].split(' ');
  
  let matchCount = 0;
  for (const word of words) {
    if (patternWords.some(p => word.match(new RegExp(p, 'i')))) {
      matchCount++;
    }
  }
  
  return Math.min(matchCount / words.length + 0.3, 1.0);
}

function extractEntities(text: string): Record<string, any> {
  const entities: Record<string, any> = {};

  // Amount detection
  const amountMatch = text.match(/R\s?\d+(\.\d{2})?|\d+(\.\d{2})?\s?rand/i);
  if (amountMatch) {
    entities.amount = parseFloat(amountMatch[0].replace(/[^\d.]/g, ''));
  }

  // Date detection
  const dateMatch = text.match(/\b\d{1,2}\s(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s?\d{4}\b/i);
  if (dateMatch) {
    entities.date = new Date(dateMatch[0]);
  }

  // Financial concept detection
  const concepts = ['saving', 'budget', 'interest', 'investment', 'debt'];
  for (const concept of concepts) {
    if (text.toLowerCase().includes(concept)) {
      entities.concept = concept;
      break;
    }
  }

  // Circle/group detection
  const circleMatch = text.match(/circle|group/i);
  if (circleMatch) {
    entities.circle = true;
  }

  return entities;
}

function generateSuggestedActions(intent: string, user: any): string[] {
  const suggestions: string[] = [];

  switch (intent) {
    case 'savings_inquiry':
      suggestions.push(
        'View savings breakdown',
        'Set new savings goal',
        'Join a money circle'
      );
      break;
    case 'circle_status':
      suggestions.push(
        'View circle details',
        'Make contribution',
        'Invite friends'
      );
      break;
    case 'financial_education':
      suggestions.push(
        'View learning modules',
        'Take a quiz',
        'Get personalized tips'
      );
      break;
    default:
      suggestions.push(
        'Check balance',
        'Start saving',
        'Join a circle'
      );
  }

  return suggestions;
}
