import { Router } from 'express';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';
import { db } from '../storage';
import { eq } from 'drizzle-orm';
import { conversations, messages, users, achievements } from '../schema';
import { generateResponse } from '../services/abby/responseGenerator';
import { processUserInput } from '../services/abby/inputProcessor';
import { updateUserProgress } from '../services/abby/progressTracker';
import { logger } from '../utils/logger';

const router = Router();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Request validation schemas
const MessageSchema = z.object({
  text: z.string().min(1).max(500),
  conversationId: z.string().optional(),
  metadata: z.object({
    context: z.string().optional(),
    type: z.enum(['text', 'achievement', 'tip', 'reward']).optional(),
    points: z.number().optional(),
    progress: z.number().optional()
  }).optional()
});

// Apply rate limiting to all routes
router.use(limiter);

// Get conversation history
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userConversations = await db.query.conversations.findMany({
      where: eq(conversations.userId, userId),
      with: {
        messages: true
      },
      orderBy: conversations.createdAt,
      limit: 10
    });

    res.json(userConversations);
  } catch (error) {
    logger.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Send message to Abby
router.post('/message', async (req, res) => {
  try {
    const { text, conversationId, metadata } = MessageSchema.parse(req.body);
    const userId = req.user.id; // Assuming auth middleware sets user

    // Process user input and generate contextual response
    const processedInput = await processUserInput(text, userId);
    const response = await generateResponse(processedInput, userId);

    // Update user progress and check for achievements
    const progressUpdate = await updateUserProgress(userId, response);

    // Save message to database
    const savedMessage = await db.insert(messages).values({
      text,
      userId,
      conversationId: conversationId || undefined,
      type: metadata?.type || 'text',
      metadata: metadata || {}
    }).returning();

    // Save Abby's response
    const savedResponse = await db.insert(messages).values({
      text: response.text,
      userId,
      conversationId: conversationId || undefined,
      type: response.type,
      metadata: response.metadata
    }).returning();

    // Check and award achievements
    if (progressUpdate.achievements.length > 0) {
      await db.insert(achievements).values(
        progressUpdate.achievements.map(achievement => ({
          userId,
          type: achievement.type,
          points: achievement.points,
          metadata: achievement.metadata
        }))
      );
    }

    res.json({
      message: savedMessage[0],
      response: savedResponse[0],
      achievements: progressUpdate.achievements,
      suggestions: response.suggestions
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      logger.error('Error processing message:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  }
});

// Get user achievements and progress
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userAchievements = await db.query.achievements.findMany({
      where: eq(achievements.userId, userId),
      orderBy: achievements.createdAt
    });

    const userProgress = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        level: true,
        points: true,
        badges: true
      }
    });

    res.json({
      achievements: userAchievements,
      progress: userProgress
    });
  } catch (error) {
    logger.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

export default router;