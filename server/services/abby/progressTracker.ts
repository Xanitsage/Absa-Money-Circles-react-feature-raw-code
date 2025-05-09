import { db } from '../../storage';
import { eq } from 'drizzle-orm';
import { users, achievements, goals } from '../../schema';
import { logger } from '../../utils/logger';

interface ProgressUpdate {
  level: number;
  points: number;
  achievements: Achievement[];
  badges: string[];
  streaks: {
    daily: number;
    weekly: number;
  };
}

interface Achievement {
  type: string;
  name: string;
  points: number;
  metadata: Record<string, any>;
}

/**
 * Update user progress based on their interactions and achievements
 */
export async function updateUserProgress(
  userId: string,
  response: any
): Promise<ProgressUpdate> {
  try {
    // Get current user state
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        level: true,
        points: true,
        badges: true,
        streaks: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Initialize progress update
    const update: ProgressUpdate = {
      level: user.level,
      points: user.points,
      achievements: [],
      badges: [...user.badges],
      streaks: user.streaks || { daily: 0, weekly: 0 }
    };

    // Update points based on interaction type
    const pointsEarned = calculatePoints(response);
    update.points += pointsEarned;

    // Check for level up
    const newLevel = calculateLevel(update.points);
    if (newLevel > update.level) {
      update.level = newLevel;
      update.achievements.push({
        type: 'level_up',
        name: `Reached Level ${newLevel}`,
        points: 100,
        metadata: {
          level: newLevel,
          unlocks: getLevelUnlocks(newLevel)
        }
      });
    }

    // Update streaks
    const streakUpdate = updateStreaks(user.streaks);
    update.streaks = streakUpdate.streaks;
    if (streakUpdate.achieved) {
      update.achievements.push({
        type: 'streak',
        name: 'Consistency Champion',
        points: 50,
        metadata: {
          streakType: streakUpdate.type,
          duration: streakUpdate.duration
        }
      });
    }

    // Check for new badges
    const newBadges = await checkForBadges(userId, update.points);
    update.badges.push(...newBadges);

    // Save updates to database
    await db.update(users)
      .set({
        level: update.level,
        points: update.points,
        badges: update.badges,
        streaks: update.streaks
      })
      .where(eq(users.id, userId));

    return update;

  } catch (error) {
    logger.error('Error updating user progress:', error);
    throw new Error('Failed to update user progress');
  }
}

/**
 * Calculate points earned based on interaction type
 */
function calculatePoints(response: any): number {
  const pointsMap = {
    text: 5, // Basic interaction
    tip: 10, // Learning from tips
    achievement: 20, // Completing achievements
    reward: 15 // Earning rewards
  };

  return pointsMap[response.type] || 5;
}

/**
 * Calculate user level based on total points
 */
function calculateLevel(points: number): number {
  // Level thresholds: each level requires more points
  const basePoints = 100;
  const multiplier = 1.5;
  let level = 1;

  while (points >= basePoints * Math.pow(multiplier, level - 1)) {
    level++;
  }

  return level;
}

/**
 * Get features and perks unlocked at each level
 */
function getLevelUnlocks(level: number): string[] {
  const unlocks: Record<number, string[]> = {
    2: ['Access to money circles', 'Basic savings tools'],
    3: ['Advanced goal tracking', 'Weekly insights'],
    4: ['Custom circle creation', 'Investment tips'],
    5: ['Premium features', 'Personal finance coach']
  };

  return unlocks[level] || [];
}

/**
 * Update user streaks and check for achievements
 */
function updateStreaks(currentStreaks: any) {
  const now = new Date();
  const lastActivity = new Date(currentStreaks?.lastActivity || 0);
  const isToday = now.toDateString() === lastActivity.toDateString();
  const isConsecutiveDay = (
    now.getTime() - lastActivity.getTime() < 48 * 60 * 60 * 1000 &&
    now.toDateString() !== lastActivity.toDateString()
  );

  const streaks = {
    daily: isConsecutiveDay ? (currentStreaks?.daily || 0) + 1 : 1,
    weekly: currentStreaks?.weekly || 0,
    lastActivity: now
  };

  // Check for streak achievements
  const achieved = streaks.daily >= 7; // Weekly streak
  const type = achieved ? 'weekly' : 'daily';
  const duration = achieved ? 7 : streaks.daily;

  return { streaks, achieved, type, duration };
}

/**
 * Check for and award new badges based on user activity
 */
async function checkForBadges(userId: string, points: number): Promise<string[]> {
  const newBadges: string[] = [];

  // Get user's current achievements
  const userAchievements = await db.query.achievements.findMany({
    where: eq(achievements.userId, userId)
  });

  // Get user's savings goals progress
  const userGoals = await db.query.goals.findMany({
    where: eq(goals.userId, userId)
  });

  // Badge criteria checks
  if (points >= 1000 && !hasBadge(userAchievements, 'points_1000')) {
    newBadges.push('Points Master');
  }

  if (userGoals.some(goal => goal.progress >= 100) && !hasBadge(userAchievements, 'goal_complete')) {
    newBadges.push('Goal Achiever');
  }

  const savingsTotal = userGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  if (savingsTotal >= 10000 && !hasBadge(userAchievements, 'savings_10000')) {
    newBadges.push('Super Saver');
  }

  return newBadges;
}

/**
 * Helper function to check if user has a specific badge
 */
function hasBadge(achievements: any[], badgeType: string): boolean {
  return achievements.some(achievement => achievement.type === badgeType);
}