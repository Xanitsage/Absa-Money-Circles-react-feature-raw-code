
import { db } from '../../storage';
import { eq } from 'drizzle-orm';
import { users, achievements, moneyCircles } from '../../schema';
import { logger } from '../../utils/logger';
import { ProcessedInput } from './inputProcessor';
import axios from 'axios';

const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const groqApiKey = process.env.GROQ_API_KEY;

async function getAIResponse(prompt: string, context: any) {
  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'anthropic/claude-3-opus',
      messages: [
        {
          role: 'system',
          content: `You are Abby, an intelligent financial assistant for Absa MoneyCircles. You specialize in helping users manage their savings groups, providing personalized financial advice, and guiding them through their financial journey. You have access to their financial data and group savings information. Be professional, friendly, and empathetic while prioritizing the user's financial wellbeing. Always provide specific, actionable advice based on the user's context.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2048,
      context
    }, {
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    logger.error('AI API error:', error);
    return null;
  }
}

interface ResponseMetadata {
  type: 'text' | 'achievement' | 'tip' | 'reward';
  points?: number;
  achievement?: string;
  progress?: number;
  rewardType?: string;
}

interface GeneratedResponse {
  text: string;
  type: 'text' | 'achievement' | 'tip' | 'reward';
  metadata: ResponseMetadata;
  suggestions: string[];
}

const responseTemplates = {
  greeting: [
    '👋 Hi {name}! How can I help you with your MoneyCircles today?',
    'Hello {name}! Ready to save and achieve your goals together? 🎯'
  ],
  savings_status: [
    'You\'ve saved R{amount} this month - that\'s {trend}% {comparison} last month! 🌟 {insight}',
    'Great progress! Your savings are now at R{amount}. {encouragement}'
  ],
  circle_progress: [
    'Your {circleName} circle is {progress}% complete! The group has saved R{amount} so far. {suggestion}',
    'Amazing teamwork in {circleName}! You\'re {progress}% towards your goal of R{targetAmount}. {encouragement}'
  ],
  achievement: [
    '🎉 Incredible! You\'ve earned the {badge} badge and {points} XP points! {encouragement}',
    '🏆 Achievement unlocked: {achievement}! That\'s {points} XP points for you! {nextGoal}'
  ],
  tip: [
    '💡 Pro tip: {tip} This could help you save an extra R{estimate} monthly.',
    '📌 Here\'s a smart saving strategy: {tip} {benefit}'
  ],
  educational: [
    '📚 {concept}: {explanation} Want to learn more about this?',
    'Let me explain {concept} in simple terms: {explanation} {followUp}'
  ]
};

const financialConcepts = {
  compound_interest: {
    explanation: 'When your money earns interest, and then that interest earns more interest. It\'s like a snowball effect for your savings!',
    example: 'If you save R100 monthly with 5% compound interest, after 5 years you\'ll have more than just R6000.'
  },
  budgeting: {
    explanation: 'The 50/30/20 rule suggests using 50% of income for needs, 30% for wants, and 20% for savings.',
    example: 'On a R10,000 income, try to save at least R2,000 monthly.'
  },
  group_saving: {
    explanation: 'MoneyCircles helps you save with friends, keeping everyone motivated and accountable.',
    example: 'Groups often save 30% more consistently than individual savers.'
  }
};

export async function generateResponse(
  input: ProcessedInput,
  userId: string
): Promise<GeneratedResponse> {
  try {
    // Get comprehensive user context
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        achievements: true,
        goals: true,
        circles: {
          with: {
            members: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Prepare context for AI
    const context = {
      user: {
        name: user.name,
        savings: user.monthlySavings,
        achievements: user.achievements,
        circles: user.circles
      },
      intent: input.intent,
      entities: input.entities
    };

    // Get AI-generated response
    const aiResponse = await getAIResponse(input.text, context);
    
    if (aiResponse) {
      const suggestions = generateContextualSuggestions(user, input);
      const newAchievements = await checkForAchievements(user, input);

      return {
        text: aiResponse,
        type: newAchievements.length > 0 ? 'achievement' : 'text',
        metadata: {
          type: newAchievements.length > 0 ? 'achievement' : 'text',
          achievement: newAchievements[0]?.name,
          points: newAchievements[0]?.points
        },
        suggestions
      };
    }
      where: eq(users.id, userId),
      with: {
        achievements: true,
        goals: true,
        circles: {
          with: {
            members: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate personalized response based on intent
    let response: GeneratedResponse;
    
    switch (input.intent) {
      case 'savings_inquiry':
        response = await generateSavingsResponse(user, input);
        break;
      case 'circle_status':
        response = await generateCircleResponse(user, input);
        break;
      case 'financial_education':
        response = await generateEducationalResponse(user, input);
        break;
      default:
        response = await generateDefaultResponse(user, input);
    }

    // Add dynamic suggestions based on context
    response.suggestions = generateContextualSuggestions(user, input);

    // Check for achievements
    const newAchievements = await checkForAchievements(user, input);
    if (newAchievements.length > 0) {
      response = {
        ...response,
        type: 'achievement',
        metadata: {
          type: 'achievement',
          achievement: newAchievements[0].name,
          points: newAchievements[0].points
        }
      };
    }

    return response;

  } catch (error) {
    logger.error('Error generating response:', error);
    return {
      text: 'I\'m having trouble processing that right now. Please try again.',
      type: 'text',
      metadata: { type: 'text' },
      suggestions: getDefaultSuggestions()
    };
  }
}

async function generateSavingsResponse(user: any, input: ProcessedInput): Promise<GeneratedResponse> {
  const monthlySavings = calculateMonthlySavings(user);
  const trend = calculateSavingsTrend(user);
  const template = responseTemplates.savings_status[Math.floor(Math.random() * responseTemplates.savings_status.length)];
  
  return {
    text: replaceVariables(template, {
      amount: formatAmount(monthlySavings),
      trend: Math.abs(trend),
      comparison: trend >= 0 ? 'more than' : 'less than',
      insight: generateSavingsInsight(user),
      encouragement: generateEncouragement(user)
    }),
    type: 'text',
    metadata: { type: 'text' },
    suggestions: generateSavingsSuggestions(user)
  };
}

async function generateCircleResponse(user: any, input: ProcessedInput): Promise<GeneratedResponse> {
  const activeCircle = user.circles[0];
  if (!activeCircle) {
    return {
      text: 'You\'re not part of any MoneyCircles yet. Would you like to create or join one?',
      type: 'text',
      metadata: { type: 'text' },
      suggestions: ['Create a circle', 'Join a circle', 'Learn about circles']
    };
  }

  const progress = calculateCircleProgress(activeCircle);
  const template = responseTemplates.circle_progress[Math.floor(Math.random() * responseTemplates.circle_progress.length)];

  return {
    text: replaceVariables(template, {
      circleName: activeCircle.name,
      progress,
      amount: formatAmount(activeCircle.currentAmount),
      targetAmount: formatAmount(activeCircle.targetAmount),
      suggestion: generateCircleSuggestion(activeCircle),
      encouragement: generateGroupEncouragement(progress)
    }),
    type: 'text',
    metadata: { type: 'text' },
    suggestions: generateCircleSuggestions(activeCircle)
  };
}

async function generateEducationalResponse(user: any, input: ProcessedInput): Promise<GeneratedResponse> {
  const concept = input.entities.concept || 'saving';
  const conceptInfo = financialConcepts[concept] || financialConcepts.budgeting;

  return {
    text: replaceVariables(responseTemplates.educational[0], {
      concept: concept.replace('_', ' '),
      explanation: conceptInfo.explanation,
      followUp: 'Would you like to see an example?'
    }),
    type: 'text',
    metadata: { type: 'text' },
    suggestions: ['Show example', 'Learn more', 'Try it now']
  };
}

function generateDefaultResponse(user: any, input: ProcessedInput): GeneratedResponse {
  return {
    text: replaceVariables(responseTemplates.greeting[0], {
      name: user.name || 'there'
    }),
    type: 'text',
    metadata: { type: 'text' },
    suggestions: getDefaultSuggestions()
  };
}

// Helper functions
function calculateMonthlySavings(user: any): number {
  // Implementation for calculating monthly savings
  return user.monthlySavings || 0;
}

function calculateSavingsTrend(user: any): number {
  // Implementation for calculating savings trend
  return 15; // Placeholder: 15% increase
}

function generateSavingsInsight(user: any): string {
  // Implementation for generating personalized savings insights
  return "You're building great saving habits!";
}

function generateEncouragement(user: any): string {
  const encouragements = [
    "Keep up the fantastic work! 🌟",
    "You're on the right track! 🎯",
    "Your future self will thank you! 💪"
  ];
  return encouragements[Math.floor(Math.random() * encouragements.length)];
}

function generateGroupEncouragement(progress: number): string {
  if (progress >= 75) {
    return "You're so close to your goal! 🎉";
  } else if (progress >= 50) {
    return "Halfway there, keep going! 💪";
  }
  return "Every contribution counts! 🌱";
}

function generateCircleSuggestion(circle: any): string {
  const suggestions = [
    "Invite more friends to boost your progress!",
    "Set up automatic contributions to stay on track.",
    "Share your success story with the group!"
  ];
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

function generateSavingsSuggestions(user: any): string[] {
  return [
    "Set up automatic savings",
    "Join a money circle",
    "Track your progress",
    "Learn saving tips"
  ];
}

function generateCircleSuggestions(circle: any): string[] {
  return [
    "View circle details",
    "Make a contribution",
    "Chat with members",
    "Share progress"
  ];
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount);
}

function replaceVariables(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => 
    variables[key]?.toString() || match
  );
}

function getDefaultSuggestions(): string[] {
  return [
    "Check my balance",
    "View my circles",
    "Start saving",
    "Get financial tips"
  ];
}

async function checkForAchievements(user: any, input: ProcessedInput): Promise<any[]> {
  const newAchievements = [];

  // Check savings milestones
  if (user.monthlySavings > 1000) {
    newAchievements.push({
      name: 'Super Saver',
      points: 100,
      description: 'Saved over R1000 this month'
    });
  }

  // Check circle participation
  if (user.circles?.length >= 3) {
    newAchievements.push({
      name: 'Circle Champion',
      points: 150,
      description: 'Joined 3 or more money circles'
    });
  }

  return newAchievements;
}
