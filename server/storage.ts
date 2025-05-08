import {
  users,
  type User,
  type InsertUser,
  savingsGoals,
  type SavingsGoal,
  type InsertSavingsGoal,
  moneyCircles,
  type MoneyCircle,
  type InsertMoneyCircle,
  circleMembers,
  type CircleMember,
  type InsertCircleMember,
  circleActivities,
  type CircleActivity,
  type InsertCircleActivity,
  messages,
  type Message,
  type InsertMessage,
  UserWallet,
  CircleDetails,
  CreateCircleData
} from "@shared/schema";
import { generateInviteCode } from "../client/src/lib/utils";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserWallet(userId: number): Promise<UserWallet>;
  
  // Savings goals operations
  getSavingsGoals(userId: number): Promise<SavingsGoal[]>;
  getSavingsGoal(id: number): Promise<SavingsGoal | undefined>;
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateSavingsGoal(id: number, goal: Partial<SavingsGoal>): Promise<SavingsGoal | undefined>;
  
  // Money circles operations
  getMoneyCircles(userId: number): Promise<MoneyCircle[]>;
  getMoneyCircle(id: number): Promise<MoneyCircle | undefined>;
  createMoneyCircle(circle: CreateCircleData, userId: number): Promise<MoneyCircle>;
  updateMoneyCircle(id: number, circle: Partial<MoneyCircle>): Promise<MoneyCircle | undefined>;
  getCircleDetails(id: number): Promise<CircleDetails | undefined>;
  getCircleByInviteCode(code: string): Promise<MoneyCircle | undefined>;
  joinCircle(circleId: number, userId: number): Promise<boolean>;
  
  // Circle members operations
  getCircleMembers(circleId: number): Promise<CircleMember[]>;
  getCircleMember(circleId: number, userId: number): Promise<CircleMember | undefined>;
  updateCircleMember(id: number, member: Partial<CircleMember>): Promise<CircleMember | undefined>;
  
  // Circle activities operations
  getCircleActivities(circleId: number): Promise<CircleActivity[]>;
  createCircleActivity(activity: InsertCircleActivity): Promise<CircleActivity>;
  
  // Messages operations
  getCircleMessages(circleId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private savingsGoals: Map<number, SavingsGoal>;
  private moneyCircles: Map<number, MoneyCircle>;
  private circleMembers: Map<number, CircleMember>;
  private circleActivities: Map<number, CircleActivity>;
  private messages: Map<number, Message>;
  
  private userId: number;
  private savingsGoalId: number;
  private moneyCircleId: number;
  private circleMemberId: number;
  private activityId: number;
  private messageId: number;

  constructor() {
    this.users = new Map();
    this.savingsGoals = new Map();
    this.moneyCircles = new Map();
    this.circleMembers = new Map();
    this.circleActivities = new Map();
    this.messages = new Map();
    
    this.userId = 1;
    this.savingsGoalId = 1;
    this.moneyCircleId = 1;
    this.circleMemberId = 1;
    this.activityId = 1;
    this.messageId = 1;
    
    // Seed some initial data
    this.seedData();
  }
  
  private seedData() {
    // Create a demo user
    const user: User = {
      id: this.userId++,
      username: "lindokuhle.msiza",
      password: "password",
      fullName: "Lindokuhle Msiza",
      email: "lindokuhle.msiza@gmail.com",
      walletBalance: 12450.00,
      xpPoints: 65,
      level: 2
    };
    this.users.set(user.id, user);
    
    // Create sample savings goals
    const holidayFund: SavingsGoal = {
      id: this.savingsGoalId++,
      userId: user.id,
      name: "Holiday Fund",
      targetAmount: 5000,
      currentAmount: 3750,
      targetDate: new Date("2023-12-31").toISOString(),
      status: "On Track",
      createdAt: new Date("2023-01-15").toISOString()
    };
    this.savingsGoals.set(holidayFund.id, holidayFund);
    
    const laptopFund: SavingsGoal = {
      id: this.savingsGoalId++,
      userId: user.id,
      name: "New Laptop",
      targetAmount: 12000,
      currentAmount: 4200,
      targetDate: new Date("2023-12-15").toISOString(),
      status: "Boost Needed",
      createdAt: new Date("2023-02-20").toISOString()
    };
    this.savingsGoals.set(laptopFund.id, laptopFund);
    
    // Create sample money circles
    const vacationCircle: MoneyCircle = {
      id: this.moneyCircleId++,
      name: "Family Vacation Fund",
      targetAmount: 20000,
      currentAmount: 15000,
      targetDate: new Date("2023-11-30").toISOString(),
      contributionFrequency: "monthly",
      autoSave: true,
      celebrateMilestones: true,
      createdById: user.id,
      createdAt: new Date("2023-04-10").toISOString(),
      inviteCode: "ABC123XY"
    };
    this.moneyCircles.set(vacationCircle.id, vacationCircle);
    
    const officePartyCircle: MoneyCircle = {
      id: this.moneyCircleId++,
      name: "Office Party",
      targetAmount: 5000,
      currentAmount: 2500,
      targetDate: new Date("2023-12-15").toISOString(),
      contributionFrequency: "bi-weekly",
      autoSave: true,
      celebrateMilestones: true,
      createdById: user.id,
      createdAt: new Date("2023-05-05").toISOString(),
      inviteCode: "XYZ789AB"
    };
    this.moneyCircles.set(officePartyCircle.id, officePartyCircle);
    
    // Create circle members
    // Vacation circle members
    const member1: CircleMember = {
      id: this.circleMemberId++,
      circleId: vacationCircle.id,
      userId: user.id,
      role: "admin",
      targetAmount: 5000,
      contributedAmount: 4000,
      joinedAt: new Date("2023-04-10").toISOString()
    };
    this.circleMembers.set(member1.id, member1);
    
    // Add some dummy members
    const dummyUsers = [
      { username: "lerato", fullName: "Lerato K." },
      { username: "thabo", fullName: "Thabo M." },
      { username: "sarah", fullName: "Sarah J." },
      { username: "michael", fullName: "Michael P." }
    ];
    
    dummyUsers.forEach((dummyUser, index) => {
      const userId = this.userId++;
      const user: User = {
        id: userId,
        username: dummyUser.username,
        password: "password",
        fullName: dummyUser.fullName,
        email: `${dummyUser.username}@example.com`,
        walletBalance: 1000 * (index + 1),
        xpPoints: 10 * (index + 1),
        level: 1
      };
      this.users.set(user.id, user);
      
      // Add to vacation circle
      if (index < 2) {
        const member: CircleMember = {
          id: this.circleMemberId++,
          circleId: vacationCircle.id,
          userId: user.id,
          role: "member",
          targetAmount: 5000,
          contributedAmount: 3000 - (index * 500),
          joinedAt: new Date("2023-04-11").toISOString()
        };
        this.circleMembers.set(member.id, member);
      }
      
      // Add to office party circle
      const member: CircleMember = {
        id: this.circleMemberId++,
        circleId: officePartyCircle.id,
        userId: user.id,
        role: index === 0 ? "admin" : "member",
        targetAmount: 1000,
        contributedAmount: 500 - (index * 100),
        joinedAt: new Date("2023-05-05").toISOString()
      };
      this.circleMembers.set(member.id, member);
    });
    
    // Add circle activities
    const activity1: CircleActivity = {
      id: this.activityId++,
      circleId: vacationCircle.id,
      userId: dummyUsers[1].username === "thabo" ? this.users.get(2)?.id : 2,
      type: "contribution",
      amount: 1000,
      details: { message: "Regular contribution" },
      createdAt: new Date("2023-10-10").toISOString()
    };
    this.circleActivities.set(activity1.id, activity1);
    
    const activity2: CircleActivity = {
      id: this.activityId++,
      circleId: vacationCircle.id,
      type: "milestone",
      details: { milestone: 75, message: "Reached 75% of goal" },
      createdAt: new Date("2023-10-08").toISOString()
    };
    this.circleActivities.set(activity2.id, activity2);
    
    const activity3: CircleActivity = {
      id: this.activityId++,
      circleId: vacationCircle.id,
      userId: dummyUsers[0].username === "lerato" ? this.users.get(3)?.id : 3,
      type: "contribution",
      amount: 500,
      details: { message: "Regular contribution" },
      createdAt: new Date("2023-10-07").toISOString()
    };
    this.circleActivities.set(activity3.id, activity3);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id, 
      walletBalance: 1000,
      xpPoints: 0,
      level: 1
    };
    this.users.set(id, user);
    return user;
  }
  
  async getUserWallet(userId: number): Promise<UserWallet> {
    const user = await this.getUser(userId);
    if (!user) {
      return { balance: 0 };
    }
    return { balance: user.walletBalance };
  }

  // Savings goals operations
  async getSavingsGoals(userId: number): Promise<SavingsGoal[]> {
    return Array.from(this.savingsGoals.values())
      .filter(goal => goal.userId === userId);
  }

  async getSavingsGoal(id: number): Promise<SavingsGoal | undefined> {
    return this.savingsGoals.get(id);
  }

  async createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal> {
    const id = this.savingsGoalId++;
    const newGoal: SavingsGoal = {
      ...goal,
      id,
      currentAmount: 0,
      createdAt: new Date().toISOString()
    };
    this.savingsGoals.set(id, newGoal);
    return newGoal;
  }

  async updateSavingsGoal(id: number, update: Partial<SavingsGoal>): Promise<SavingsGoal | undefined> {
    const goal = this.savingsGoals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...update };
    this.savingsGoals.set(id, updatedGoal);
    return updatedGoal;
  }

  // Money circles operations
  async getMoneyCircles(userId: number): Promise<MoneyCircle[]> {
    // Get all circles where user is a member
    const memberCircleIds = Array.from(this.circleMembers.values())
      .filter(member => member.userId === userId)
      .map(member => member.circleId);
    
    return Array.from(this.moneyCircles.values())
      .filter(circle => memberCircleIds.includes(circle.id) || circle.createdById === userId);
  }

  async getMoneyCircle(id: number): Promise<MoneyCircle | undefined> {
    return this.moneyCircles.get(id);
  }

  async createMoneyCircle(circleData: CreateCircleData, userId: number): Promise<MoneyCircle> {
    const id = this.moneyCircleId++;
    const inviteCode = generateInviteCode();
    
    const newCircle: MoneyCircle = {
      id,
      name: circleData.name,
      targetAmount: circleData.targetAmount,
      currentAmount: 0,
      targetDate: circleData.targetDate,
      contributionFrequency: circleData.contributionFrequency,
      autoSave: circleData.autoSave,
      celebrateMilestones: circleData.celebrateMilestones,
      createdById: userId,
      createdAt: new Date().toISOString(),
      inviteCode
    };
    
    this.moneyCircles.set(id, newCircle);
    
    // Add creator as an admin member
    const memberContribution = Math.round(newCircle.targetAmount / 5); // 20% of target by default
    
    const newMember: CircleMember = {
      id: this.circleMemberId++,
      circleId: id,
      userId,
      role: "admin",
      targetAmount: memberContribution,
      contributedAmount: 0,
      joinedAt: new Date().toISOString()
    };
    
    this.circleMembers.set(newMember.id, newMember);
    
    // Create an activity for circle creation
    const activity: CircleActivity = {
      id: this.activityId++,
      circleId: id,
      userId,
      type: "circle_created",
      details: { message: "Circle was created" },
      createdAt: new Date().toISOString()
    };
    
    this.circleActivities.set(activity.id, activity);
    
    return newCircle;
  }

  async updateMoneyCircle(id: number, update: Partial<MoneyCircle>): Promise<MoneyCircle | undefined> {
    const circle = this.moneyCircles.get(id);
    if (!circle) return undefined;
    
    const updatedCircle = { ...circle, ...update };
    this.moneyCircles.set(id, updatedCircle);
    return updatedCircle;
  }

  async getCircleDetails(id: number): Promise<CircleDetails | undefined> {
    const circle = this.moneyCircles.get(id);
    if (!circle) return undefined;
    
    const creator = this.users.get(circle.createdById);
    const members = Array.from(this.circleMembers.values())
      .filter(member => member.circleId === id);
    
    return {
      ...circle,
      createdBy: creator?.fullName || "Unknown",
      memberCount: members.length
    } as CircleDetails;
  }

  async getCircleByInviteCode(code: string): Promise<MoneyCircle | undefined> {
    return Array.from(this.moneyCircles.values())
      .find(circle => circle.inviteCode === code);
  }

  async joinCircle(circleId: number, userId: number): Promise<boolean> {
    const circle = this.moneyCircles.get(circleId);
    if (!circle) return false;
    
    // Check if user is already a member
    const existingMember = Array.from(this.circleMembers.values())
      .find(member => member.circleId === circleId && member.userId === userId);
    
    if (existingMember) return true;
    
    // Calculate equal contribution for new member
    const memberCount = Array.from(this.circleMembers.values())
      .filter(member => member.circleId === circleId).length;
    
    const memberContribution = Math.round(circle.targetAmount / (memberCount + 1));
    
    // Add user as a member
    const newMember: CircleMember = {
      id: this.circleMemberId++,
      circleId,
      userId,
      role: "member",
      targetAmount: memberContribution,
      contributedAmount: 0,
      joinedAt: new Date().toISOString()
    };
    
    this.circleMembers.set(newMember.id, newMember);
    
    // Create an activity for joining
    const activity: CircleActivity = {
      id: this.activityId++,
      circleId,
      userId,
      type: "member_joined",
      details: { message: "New member joined the circle" },
      createdAt: new Date().toISOString()
    };
    
    this.circleActivities.set(activity.id, activity);
    
    return true;
  }

  // Circle members operations
  async getCircleMembers(circleId: number): Promise<CircleMember[]> {
    return Array.from(this.circleMembers.values())
      .filter(member => member.circleId === circleId);
  }

  async getCircleMember(circleId: number, userId: number): Promise<CircleMember | undefined> {
    return Array.from(this.circleMembers.values())
      .find(member => member.circleId === circleId && member.userId === userId);
  }

  async updateCircleMember(id: number, update: Partial<CircleMember>): Promise<CircleMember | undefined> {
    const member = this.circleMembers.get(id);
    if (!member) return undefined;
    
    const updatedMember = { ...member, ...update };
    this.circleMembers.set(id, updatedMember);
    return updatedMember;
  }

  // Circle activities operations
  async getCircleActivities(circleId: number): Promise<CircleActivity[]> {
    return Array.from(this.circleActivities.values())
      .filter(activity => activity.circleId === circleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createCircleActivity(activity: InsertCircleActivity): Promise<CircleActivity> {
    const id = this.activityId++;
    const newActivity: CircleActivity = {
      ...activity,
      id,
      createdAt: new Date().toISOString()
    };
    this.circleActivities.set(id, newActivity);
    return newActivity;
  }

  // Messages operations
  async getCircleMessages(circleId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.circleId === circleId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const newMessage: Message = {
      ...message,
      id,
      createdAt: new Date().toISOString()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }
}

export const storage = new MemStorage();
