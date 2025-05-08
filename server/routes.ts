import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createCircleSchema } from "@shared/schema";
import { z } from "zod";
import { formatTimeAgo, generateInviteCode } from "../client/src/lib/utils";
import { WebSocketServer } from "ws";
import WebSocket from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Set up WebSocket server for real-time chat functionality
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // WebSocket connection handling
  wss.on('connection', (ws) => {
    let circleId: string | null = null;

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        if (data.type === 'join') {
          circleId = data.circleId;
        } else if (data.type === 'chat' && circleId) {
          // Broadcast the message to all clients in the same circle
          wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'chat',
                circleId: circleId,
                message: data.message,
                sender: data.sender,
                timestamp: new Date().toISOString()
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
  });

  // API routes
  
  // Get current user
  app.get('/api/user', async (req: Request, res: Response) => {
    try {
      // For now, simulate user ID 1 as the logged-in user
      const userId = 1;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });
  app.get('/api/wallet', async (req: Request, res: Response) => {
    try {
      // For now, simulate user ID 1 as the logged-in user
      const wallet = await storage.getUserWallet(1);
      res.json(wallet);
    } catch (error) {
      console.error('Error fetching wallet:', error);
      res.status(500).json({ message: 'Failed to fetch wallet' });
    }
  });

  app.get('/api/savings', async (req: Request, res: Response) => {
    try {
      // For now, simulate user ID 1 as the logged-in user
      const savingsGoals = await storage.getSavingsGoals(1);
      res.json(savingsGoals);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      res.status(500).json({ message: 'Failed to fetch savings goals' });
    }
  });

  app.get('/api/circles', async (req: Request, res: Response) => {
    try {
      // For now, simulate user ID 1 as the logged-in user
      const userId = 1;
      const circles = await storage.getMoneyCircles(userId);
      
      const enrichedCircles = await Promise.all(circles.map(async (circle) => {
        // Get member information
        const members = await storage.getCircleMembers(circle.id);
        const memberUsers = await Promise.all(members.map(async (member) => {
          const user = await storage.getUser(member.userId);
          return {
            id: member.id,
            name: user?.fullName || 'Unknown User'
          };
        }));

        // Get time ago in text format
        const startedTimeAgo = formatTimeAgo(new Date(circle.createdAt));
        
        // Calculate pending contributions
        const pendingContributions = members.filter(
          member => member.contributedAmount < member.targetAmount * 0.5
        ).length;

        return {
          id: circle.id,
          name: circle.name,
          targetAmount: circle.targetAmount,
          currentAmount: circle.currentAmount,
          targetDate: circle.targetDate,
          memberCount: members.length,
          members: memberUsers,
          unreadMessages: Math.floor(Math.random() * 10), // This would be calculated from actual messages
          startedTimeAgo,
          pendingContributions
        };
      }));

      res.json(enrichedCircles);
    } catch (error) {
      console.error('Error fetching circles:', error);
      res.status(500).json({ message: 'Failed to fetch circles' });
    }
  });

  app.get('/api/circles/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const circleId = parseInt(id);
      
      if (isNaN(circleId)) {
        return res.status(400).json({ message: 'Invalid circle ID' });
      }

      const circleDetails = await storage.getCircleDetails(circleId);
      
      if (!circleDetails) {
        return res.status(404).json({ message: 'Circle not found' });
      }

      // Get member information
      const members = await storage.getCircleMembers(circleId);
      const memberUsers = await Promise.all(members.map(async (member) => {
        const user = await storage.getUser(member.userId);
        return {
          id: member.id,
          name: user?.fullName || 'Unknown User'
        };
      }));

      // Get time ago in text format
      const startedTimeAgo = formatTimeAgo(new Date(circleDetails.createdAt));
      
      // Calculate pending contributions
      const pendingContributions = members.filter(
        member => member.contributedAmount < member.targetAmount * 0.5
      ).length;

      const fullDetails = {
        ...circleDetails,
        memberCount: members.length,
        members: memberUsers,
        unreadMessages: Math.floor(Math.random() * 10), // This would be calculated from actual messages
        startedTimeAgo,
        pendingContributions
      };

      res.json(fullDetails);
    } catch (error) {
      console.error('Error fetching circle details:', error);
      res.status(500).json({ message: 'Failed to fetch circle details' });
    }
  });

  app.post('/api/circles', async (req: Request, res: Response) => {
    try {
      // Validate request body using Zod schema
      const validationResult = createCircleSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid circle data', 
          errors: validationResult.error.errors 
        });
      }
      
      // For now, simulate user ID 1 as the logged-in user
      const userId = 1;
      
      // Create the money circle
      const circle = await storage.createMoneyCircle(validationResult.data, userId);
      
      res.status(201).json(circle);
    } catch (error) {
      console.error('Error creating circle:', error);
      res.status(500).json({ message: 'Failed to create circle' });
    }
  });

  app.post('/api/circles/join', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: 'Invite code is required' });
      }
      
      // Find circle by invite code
      const circle = await storage.getCircleByInviteCode(code);
      
      if (!circle) {
        return res.status(404).json({ message: 'Invalid invite code or circle not found' });
      }
      
      // For now, simulate user ID 1 as the logged-in user
      const userId = 1;
      
      // Join the circle
      const joined = await storage.joinCircle(circle.id, userId);
      
      if (!joined) {
        return res.status(400).json({ message: 'Failed to join circle' });
      }
      
      res.status(200).json({ id: circle.id, message: 'Successfully joined circle' });
    } catch (error) {
      console.error('Error joining circle:', error);
      res.status(500).json({ message: 'Failed to join circle' });
    }
  });

  app.get('/api/circles/:id/activities', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const circleId = parseInt(id);
      
      if (isNaN(circleId)) {
        return res.status(400).json({ message: 'Invalid circle ID' });
      }

      const activities = await storage.getCircleActivities(circleId);
      
      // Enrich activities with user info and format for frontend
      const enrichedActivities = await Promise.all(activities.map(async (activity) => {
        let user = null;
        if (activity.userId) {
          user = await storage.getUser(activity.userId);
        }
        
        // Handle milestone type activities with appropriate details
        let milestone: number | undefined = undefined;
        if (activity.type === 'milestone' && activity.details) {
          const details = activity.details as { milestone?: number, message?: string };
          milestone = details.milestone;
        }
        
        return {
          id: activity.id,
          type: activity.type,
          user: user?.fullName || undefined,
          amount: activity.amount,
          milestone: milestone,
          timeAgo: formatTimeAgo(new Date(activity.createdAt))
        };
      }));

      res.json(enrichedActivities);
    } catch (error) {
      console.error('Error fetching circle activities:', error);
      res.status(500).json({ message: 'Failed to fetch circle activities' });
    }
  });

  app.get('/api/circles/:id/members', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const circleId = parseInt(id);
      
      if (isNaN(circleId)) {
        return res.status(400).json({ message: 'Invalid circle ID' });
      }

      const members = await storage.getCircleMembers(circleId);
      
      // Enrich member data with user info and format for frontend
      const enrichedMembers = await Promise.all(members.map(async (member) => {
        const user = await storage.getUser(member.userId);
        
        // For demonstration, consider user ID 1 as "You"
        const isYou = member.userId === 1;
        
        const status = member.contributedAmount >= member.targetAmount * 0.75 ? 'On Track' : 'Needs Boost';
        
        return {
          id: member.id,
          name: user?.fullName || 'Unknown User',
          role: member.role,
          contributed: member.contributedAmount,
          target: member.targetAmount,
          status,
          isYou
        };
      }));

      res.json(enrichedMembers);
    } catch (error) {
      console.error('Error fetching circle members:', error);
      res.status(500).json({ message: 'Failed to fetch circle members' });
    }
  });

  app.post('/api/circles/:id/contribute', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const circleId = parseInt(id);
      
      if (isNaN(circleId)) {
        return res.status(400).json({ message: 'Invalid circle ID' });
      }
      
      // Validate request body
      const schema = z.object({
        amount: z.number().positive('Amount must be positive')
      });
      
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid contribution data', 
          errors: validationResult.error.errors 
        });
      }
      
      const { amount } = validationResult.data;
      
      // For now, simulate user ID 1 as the logged-in user
      const userId = 1;
      
      // Get circle and member
      const circle = await storage.getMoneyCircle(circleId);
      if (!circle) {
        return res.status(404).json({ message: 'Circle not found' });
      }
      
      const member = await storage.getCircleMember(circleId, userId);
      if (!member) {
        return res.status(404).json({ message: 'You are not a member of this circle' });
      }
      
      // Update member's contribution amount
      const updatedMember = await storage.updateCircleMember(member.id, {
        contributedAmount: member.contributedAmount + amount
      });
      
      if (!updatedMember) {
        return res.status(500).json({ message: 'Failed to update contribution' });
      }
      
      // Update circle's current amount
      const updatedCircle = await storage.updateMoneyCircle(circleId, {
        currentAmount: circle.currentAmount + amount
      });
      
      if (!updatedCircle) {
        return res.status(500).json({ message: 'Failed to update circle amount' });
      }
      
      // Record activity
      await storage.createCircleActivity({
        circleId,
        userId,
        type: 'contribution',
        amount,
        details: { message: `Contributed ${amount}` }
      });
      
      // Check if this contribution reaches a milestone
      const newProgress = Math.round((updatedCircle.currentAmount / updatedCircle.targetAmount) * 100);
      const previousProgress = Math.round(((updatedCircle.currentAmount - amount) / updatedCircle.targetAmount) * 100);
      
      // Check if we crossed a milestone (25%, 50%, 75%)
      const milestones = [25, 50, 75, 100];
      for (const milestone of milestones) {
        if (previousProgress < milestone && newProgress >= milestone) {
          // Record milestone activity
          await storage.createCircleActivity({
            circleId,
            type: 'milestone',
            details: { milestone, message: `Reached ${milestone}% of goal` }
          });
          break;
        }
      }
      
      res.status(200).json({ 
        message: 'Contribution successful', 
        newTotal: updatedMember.contributedAmount,
        circleTotal: updatedCircle.currentAmount
      });
    } catch (error) {
      console.error('Error making contribution:', error);
      res.status(500).json({ message: 'Failed to make contribution' });
    }
  });

  app.get('/api/circles/:id/messages', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const circleId = parseInt(id);
      
      if (isNaN(circleId)) {
        return res.status(400).json({ message: 'Invalid circle ID' });
      }

      const messages = await storage.getCircleMessages(circleId);
      
      // Enrich messages with user info
      const enrichedMessages = await Promise.all(messages.map(async (message) => {
        const user = await storage.getUser(message.userId);
        
        return {
          id: message.id,
          content: message.content,
          sender: user?.fullName || 'Unknown User',
          senderId: message.userId,
          timestamp: message.createdAt,
          timeAgo: formatTimeAgo(new Date(message.createdAt))
        };
      }));

      res.json(enrichedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.post('/api/circles/:id/messages', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const circleId = parseInt(id);
      
      if (isNaN(circleId)) {
        return res.status(400).json({ message: 'Invalid circle ID' });
      }
      
      // Validate request body
      const schema = z.object({
        content: z.string().min(1, 'Message cannot be empty')
      });
      
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid message data', 
          errors: validationResult.error.errors 
        });
      }
      
      const { content } = validationResult.data;
      
      // For now, simulate user ID 1 as the logged-in user
      const userId = 1;
      
      // Create the message
      const message = await storage.createMessage({
        circleId,
        userId,
        content
      });
      
      // Get user info for response
      const user = await storage.getUser(userId);
      
      const enrichedMessage = {
        id: message.id,
        content: message.content,
        sender: user?.fullName || 'Unknown User',
        senderId: message.userId,
        timestamp: message.createdAt,
        timeAgo: formatTimeAgo(new Date(message.createdAt))
      };
      
      res.status(201).json(enrichedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  return httpServer;
}
