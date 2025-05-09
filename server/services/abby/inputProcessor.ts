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

/**
 * Process and analyze user input to determine intent and extract relevant entities
 */
export async function processUserInput(text: string, userId: string): Promise<ProcessedInput> {
  try {
    // Get user context
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        level: true,
        points: true,
        preferences: true
      },
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

    // Basic intent classification
    const intent = classifyIntent(text.toLowerCase());
    
    // Entity extraction
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
      confidence: calculateConfidence(intent, entities)
    };

  } catch (error) {
    logger.error('Error processing user input:', error);
    throw new Error('Failed to process user input');
  }
}

/**
 * Classify the user's intent based on message content
 */
function classifyIntent(text: string): string {
  const intents = {
    balance: ['balance', 'money', 'account', 'how much'],
    transfer: ['send', 'transfer', 'pay', 'payment'],
    savings: ['save', 'saving', 'goal', 'target'],
    circles: ['circle', 'group', 'join', 'create'],
    help: ['help', 'how', 'what', 'guide'],
    rewards: ['reward', 'point', 'badge', 'achievement'],
    learn: ['learn', 'teach', 'explain', 'understand']
  };

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return intent;
    }
  }

  return 'general';
}

/**
 * Extract relevant entities from the user's message
 */
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

  // Contact/recipient detection
  const contactMatch = text.match(/to\s+([\w\s]+)/i);
  if (contactMatch) {
    entities.recipient = contactMatch[1].trim();
  }

  return entities;
}

/**
 * Generate contextual suggested actions based on intent and user state
 */
function generateSuggestedActions(intent: string, user: any): string[] {
  const suggestions: string[] = [];

  switch (intent) {
    case 'balance':
      suggestions.push(
        'View transaction history',
        'Set up spending alerts',
        'Create a savings goal'
      );
      break;
    case 'transfer':
      suggestions.push(
        'Schedule recurring payment',
        'Add new beneficiary',
        'View payment limits'
      );
      break;
    case 'savings':
      suggestions.push(
        'Join a money circle',
        'Set up auto-save',
        'Track your progress'
      );
      break;
    case 'circles':
      suggestions.push(
        'Create new circle',
        'View circle benefits',
        'Invite friends'
      );
      break;
    default:
      suggestions.push(
        'Check account balance',
        'View savings goals',
        'Explore money circles'
      );
  }

  return suggestions;
}

/**
 * Calculate confidence score for intent classification
 */
function calculateConfidence(intent: string, entities: Record<string, any>): number {
  let confidence = 0.6; // Base confidence

  // Adjust based on intent clarity
  if (intent !== 'general') {
    confidence += 0.2;
  }

  // Adjust based on entity presence
  if (Object.keys(entities).length > 0) {
    confidence += 0.1 * Object.keys(entities).length;
  }

  // Cap at 1.0
  return Math.min(confidence, 1.0);
}