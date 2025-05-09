import { db } from '../../storage';
import { eq } from 'drizzle-orm';
import { users, achievements } from '../../schema';
import { logger } from '../../utils/logger';
import { ProcessedInput } from './inputProcessor';

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

// Enhanced responses with personalization and gamification
const responseTemplates = {
  balance: [
    'Your current balance is {amount}. 💰 {trend}',
    'You have {amount} available. {insight}'
  ],
  savings: [
    'You\'re {progress}% towards your {goalName} goal! 🎯 {encouragement}',
    'Great progress! You\'ve saved {amount} this month. {tip}'
  ],
  circles: [
    'Your {circleName} circle has reached {progress}% of its goal! 🌟 {update}',
    'The group has saved {amount} so far. {suggestion}'
  ],
  achievement: [
    '🎉 Congratulations! You\'ve earned the {badge} badge and {points} XP points!',
    '🏆 Achievement unlocked: {achievement}! You\'ve earned {points} XP.'
  ],
  tip: [
    '💡 Pro tip: {tip}',
    '📌 Quick tip: {tip}'
  ],
  reward: [
    '🎁 You\'ve earned {points} reward points! {redemption}',
    '🌟 Special reward unlocked: {reward}! {description}'
  ]
};

/**
 * Generate a personalized response based on processed input and user context
 */
export async function generateResponse(
  input: ProcessedInput,
  userId: string
): Promise<GeneratedResponse> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        achievements: true,
        goals: true,
        circles: true
      }
    });

    // Generate base response
    const response = await generateBaseResponse(input, user);

    // Check for achievements
    const newAchievements = await checkAchievements(input, user);
    if (newAchievements.length > 0) {
      response.type = 'achievement';
      response.metadata = {
        type: 'achievement',
        achievement: newAchievements[0].name,
        points: newAchievements[0].points
      };
    }

    // Add personalized suggestions
    response.suggestions = generatePersonalizedSuggestions(input, user);

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

/**
 * Generate the base response using templates and context
 */
async function generateBaseResponse(
  input: ProcessedInput,
  user: any
): Promise<GeneratedResponse> {
  const { intent, entities, context } = input;
  let template = '';
  let variables: Record<string, string> = {};

  switch (intent) {
    case 'balance':
      template = responseTemplates.balance[Math.floor(Math.random() * responseTemplates.balance.length)];
      variables = {
        amount: formatAmount(user.balance),
        trend: generateBalanceTrend(user),
        insight: generateFinancialInsight(user)
      };
      break;

    case 'savings':
      template = responseTemplates.savings[Math.floor(Math.random() * responseTemplates.savings.length)];
      variables = {
        progress: calculateProgress(user.goals),
        goalName: user.goals[0]?.name || 'savings',
        amount: formatAmount(user.monthlySavings),
        tip: generateSavingsTip(user)
      };
      break;

    case 'circles':
      template = responseTemplates.circles[Math.floor(Math.random() * responseTemplates.circles.length)];
      variables = {
        circleName: user.circles[0]?.name || 'money',
        progress: calculateCircleProgress(user.circles[0]),
        amount: formatAmount(user.circles[0]?.totalSaved || 0),
        suggestion: generateCircleSuggestion(user)
      };
      break;

    default:
      return {
        text: 'I\'m here to help! What would you like to know about your finances?',
        type: 'text',
        metadata: { type: 'text' },
        suggestions: getDefaultSuggestions()
      };
  }

  const text = replaceVariables(template, variables);

  return {
    text,
    type: 'text',
    metadata: { type: 'text' },
    suggestions: []
  };
}

/**
 * Check for and generate new achievements based on user actions
 */
async function checkAchievements(input: ProcessedInput, user: any) {
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

  // Check learning progress
  if (input.intent === 'learn') {
    newAchievements.push({
      name: 'Financial Scholar',
      points: 50,
      description: 'Engaged with financial education content'
    });
  }

  return newAchievements;
}

/**
 * Generate personalized suggestions based on user context
 */
function generatePersonalizedSuggestions(input: ProcessedInput, user: any): string[] {
  const suggestions: string[] = [];

  // Add goal-based suggestions
  if (user.goals?.length > 0) {
    suggestions.push(`Track your ${user.goals[0].name} goal progress`);
  }

  // Add circle-based suggestions
  if (user.circles?.length > 0) {
    suggestions.push(`Check your ${user.circles[0].name} circle updates`);
  }

  // Add level-based suggestions
  if (user.level < 5) {
    suggestions.push('Complete more actions to level up');
  }

  // Add default suggestions if needed
  while (suggestions.length < 3) {
    suggestions.push(...getDefaultSuggestions());
  }

  return suggestions.slice(0, 5); // Return max 5 suggestions
}

// Helper functions
function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount);
}

function generateBalanceTrend(user: any): string {
  // Implement balance trend analysis
  return 'Your spending is on track this month.';
}

function generateFinancialInsight(user: any): string {
  // Implement personalized financial insights
  return 'You\'ve reduced your spending by 15% compared to last month.';
}

function calculateProgress(goals: any[]): number {
  if (!goals?.length) return 0;
  return Math.round((goals[0].currentAmount / goals[0].targetAmount) * 100);
}

function generateSavingsTip(user: any): string {
  const tips = [
    'Setting up automatic savings can help you reach your goals faster.',
    'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
    'Joining a money circle can make saving more fun and social!'
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

function calculateCircleProgress(circle: any): number {
  if (!circle) return 0;
  return Math.round((circle.currentAmount / circle.targetAmount) * 100);
}

function generateCircleSuggestion(user: any): string {
  const suggestions = [
    'Invite more friends to boost your circle\'s progress!',
    'Set up automatic contributions to stay on track.',
    'Share your success story with the group!'
  ];
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

function replaceVariables(template: string, variables: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => variables[key] || match);
}

function getDefaultSuggestions(): string[] {
  return [
    'Check your balance',
    'View savings goals',
    'Join a money circle',
    'Send money',
    'Learn about investing'
  ];
}
import { generateResponse } from '../services/abby/responseGenerator';

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error('API_KEY environment variable is not set');
}