import { pgTable, text, serial, integer, boolean, date, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  walletBalance: real("wallet_balance").default(0).notNull(),
  xpPoints: integer("xp_points").default(0).notNull(),
  level: integer("level").default(1).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
});

// Savings Goals
export const savingsGoals = pgTable("savings_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  targetAmount: real("target_amount").notNull(),
  currentAmount: real("current_amount").default(0).notNull(),
  targetDate: date("target_date").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSavingsGoalSchema = createInsertSchema(savingsGoals).pick({
  userId: true,
  name: true,
  targetAmount: true,
  targetDate: true,
  status: true,
});

// Money Circles
export const moneyCircles = pgTable("money_circles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  targetAmount: real("target_amount").notNull(),
  currentAmount: real("current_amount").default(0).notNull(),
  targetDate: date("target_date").notNull(),
  contributionFrequency: text("contribution_frequency").notNull(),
  autoSave: boolean("auto_save").default(true).notNull(),
  celebrateMilestones: boolean("celebrate_milestones").default(true).notNull(),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  inviteCode: text("invite_code").notNull().unique(),
});

export const createCircleSchema = z.object({
  name: z.string().min(3, "Circle name must be at least 3 characters"),
  targetAmount: z.number().min(100, "Target amount must be at least R100"),
  targetDate: z.string().refine(date => new Date(date) > new Date(), {
    message: "Target date must be in the future",
  }),
  contributionFrequency: z.enum(["weekly", "monthly", "yearly"]),
  autoSave: z.boolean().default(true),
  celebrateMilestones: z.boolean().default(true),
});

export const insertMoneyCircleSchema = createInsertSchema(moneyCircles).pick({
  name: true,
  targetAmount: true,
  targetDate: true,
  contributionFrequency: true,
  autoSave: true,
  celebrateMilestones: true,
  createdById: true,
  inviteCode: true,
});

// Circle Members
export const circleMembers = pgTable("circle_members", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").notNull().references(() => moneyCircles.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // 'admin' or 'member'
  targetAmount: real("target_amount").notNull(),
  contributedAmount: real("contributed_amount").default(0).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const insertCircleMemberSchema = createInsertSchema(circleMembers).pick({
  circleId: true,
  userId: true,
  role: true,
  targetAmount: true,
});

// Circle Activities
export const circleActivities = pgTable("circle_activities", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").notNull().references(() => moneyCircles.id),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // 'contribution', 'milestone', 'member_joined', etc.
  amount: real("amount"),
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCircleActivitySchema = createInsertSchema(circleActivities).pick({
  circleId: true,
  userId: true,
  type: true,
  amount: true,
  details: true,
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").notNull().references(() => moneyCircles.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  circleId: true,
  userId: true,
  content: true,
});

// Types
// Database entity types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type DB_SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;

export type DB_MoneyCircle = typeof moneyCircles.$inferSelect;
export type InsertMoneyCircle = z.infer<typeof insertMoneyCircleSchema>;
export type CreateCircleData = z.infer<typeof createCircleSchema>;

export type DB_CircleMember = typeof circleMembers.$inferSelect;
export type InsertCircleMember = z.infer<typeof insertCircleMemberSchema>;

export type DB_CircleActivity = typeof circleActivities.$inferSelect;
export type InsertCircleActivity = z.infer<typeof insertCircleActivitySchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Extended types for frontend use
export interface UserWallet {
  balance: number;
}

// Define UI interfaces
export interface SavingsGoal {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  status: string;
}

interface MoneyCircleMember {
  id: number;
  name: string;
}

// Export the final interface that merges DB and UI fields
export interface MoneyCircle {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  contributionFrequency: string;
  autoSave: boolean;
  celebrateMilestones: boolean;
  createdById: number;
  createdAt: Date;
  inviteCode: string;
  // UI display fields
  memberCount: number;
  members: MoneyCircleMember[];
  unreadMessages: number;
  startedTimeAgo: string;
  pendingContributions: number;
}

export interface CircleDetails {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  contributionFrequency: string;
  autoSave: boolean;
  celebrateMilestones: boolean;
  createdById: number;
  createdBy: string;
  createdAt: string;
  inviteCode: string;
  memberCount: number;
  members: MoneyCircleMember[];
  unreadMessages: number;
  startedTimeAgo: string;
  pendingContributions: number;
}

export interface CircleMember {
  id: number;
  name: string;
  role: string;
  contributed: number;
  target: number;
  status: string;
  isYou: boolean;
}

export interface CircleActivity {
  id: number;
  type: string;
  user?: string;
  amount?: number;
  milestone?: number;
  timeAgo: string;
}
