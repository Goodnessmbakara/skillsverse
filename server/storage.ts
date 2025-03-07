import { users, jobs, matches, learningResources, type User, type Job, type Match, type LearningResource, type InsertUser, type InsertJob, type InsertMatch, type InsertLearningResource } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserReputation(id: number, points: number): Promise<User>;

  // Job operations
  getJob(id: number): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  getJobsByEmployer(employerId: number): Promise<Job[]>;
  getJobsByBlockchain(blockchain: string): Promise<Job[]>;

  // Match operations
  createMatch(match: InsertMatch): Promise<Match>;
  getMatchesByUser(userId: number): Promise<Match[]>;
  getMatchesByJob(jobId: number): Promise<Match[]>;
  updateMatchStatus(id: number, status: string): Promise<Match>;

  // Learning resource operations
  createLearningResource(resource: InsertLearningResource): Promise<LearningResource>;
  getLearningResources(): Promise<LearningResource[]>;
  getLearningResourcesBySkill(skill: string): Promise<LearningResource[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobs: Map<number, Job>;
  private matches: Map<number, Match>;
  private learningResources: Map<number, LearningResource>;
  private currentUserId: number;
  private currentJobId: number;
  private currentMatchId: number;
  private currentResourceId: number;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.matches = new Map();
    this.learningResources = new Map();
    this.currentUserId = 1;
    this.currentJobId = 1;
    this.currentMatchId = 1;
    this.currentResourceId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      bio: insertUser.bio ?? null,
      skills: insertUser.skills ?? null,
      experience: insertUser.experience ?? null,
      avatar: insertUser.avatar ?? null,
      walletAddress: insertUser.walletAddress ?? null,
      reputation: 0,
      achievements: [],
      onchainActivity: {},
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserReputation(id: number, points: number): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const updatedUser = {
      ...user,
      reputation: (user.reputation || 0) + points
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.currentJobId++;
    const job: Job = {
      ...insertJob,
      id,
      requirements: insertJob.requirements ?? null,
      salary: insertJob.salary ?? null,
      location: insertJob.location ?? null,
      companyLogo: insertJob.companyLogo ?? null,
      paymentToken: insertJob.paymentToken ?? null,
      createdAt: new Date(),
    };
    this.jobs.set(id, job);
    return job;
  }

  async getJobsByEmployer(employerId: number): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(
      (job) => job.employerId === employerId
    );
  }

  async getJobsByBlockchain(blockchain: string): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(
      (job) => job.blockchain === blockchain
    );
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = this.currentMatchId++;
    const match: Match = {
      ...insertMatch,
      id,
      aiMatchData: insertMatch.aiMatchData ?? {},
      createdAt: new Date(),
    };
    this.matches.set(id, match);
    return match;
  }

  async getMatchesByUser(userId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.userId === userId
    );
  }

  async getMatchesByJob(jobId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.jobId === jobId
    );
  }

  async updateMatchStatus(id: number, status: string): Promise<Match> {
    const match = this.matches.get(id);
    if (!match) throw new Error("Match not found");

    const updatedMatch = { ...match, status };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }

  async createLearningResource(resource: InsertLearningResource): Promise<LearningResource> {
    const id = this.currentResourceId++;
    const learningResource: LearningResource = {
      ...resource,
      id,
      skills: resource.skills ?? null,
      blockchain: resource.blockchain ?? null,
      createdAt: new Date(),
    };
    this.learningResources.set(id, learningResource);
    return learningResource;
  }

  async getLearningResources(): Promise<LearningResource[]> {
    return Array.from(this.learningResources.values());
  }

  async getLearningResourcesBySkill(skill: string): Promise<LearningResource[]> {
    return Array.from(this.learningResources.values()).filter(
      (resource) => resource.skills?.includes(skill)
    );
  }
}

export const storage = new MemStorage();