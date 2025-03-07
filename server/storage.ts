import { users, jobs, matches, type User, type Job, type Match, type InsertUser, type InsertJob, type InsertMatch } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Job operations
  getJob(id: number): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  getJobsByEmployer(employerId: number): Promise<Job[]>;
  
  // Match operations
  createMatch(match: InsertMatch): Promise<Match>;
  getMatchesByUser(userId: number): Promise<Match[]>;
  getMatchesByJob(jobId: number): Promise<Match[]>;
  updateMatchStatus(id: number, status: string): Promise<Match>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobs: Map<number, Job>;
  private matches: Map<number, Match>;
  private currentUserId: number;
  private currentJobId: number;
  private currentMatchId: number;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.matches = new Map();
    this.currentUserId = 1;
    this.currentJobId = 1;
    this.currentMatchId = 1;
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.currentJobId++;
    const job: Job = { ...insertJob, id };
    this.jobs.set(id, job);
    return job;
  }

  async getJobsByEmployer(employerId: number): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(
      (job) => job.employerId === employerId
    );
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = this.currentMatchId++;
    const match: Match = { ...insertMatch, id };
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
}

export const storage = new MemStorage();
