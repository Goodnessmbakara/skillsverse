import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User profile schema with Web3 and skill verification
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  bio: text("bio"),
  skills: text("skills").array(),
  experience: integer("experience"),
  avatar: text("avatar"),
  type: text("type").notNull(), // "candidate" or "employer"
  walletAddress: text("wallet_address"), // Web3 wallet for verification
  reputation: integer("reputation").default(0),
  achievements: jsonb("achievements").default([]), // Earned badges and certifications
  onchainActivity: jsonb("onchain_activity").default({}), // Record of blockchain contributions
  createdAt: timestamp("created_at").defaultNow(),
});

// Job listing schema with Web3 focus
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").array(),
  salary: text("salary"),
  location: text("location"),
  companyLogo: text("company_logo"),
  employerId: integer("employer_id").notNull(),
  blockchain: text("blockchain").notNull(), // e.g. "sui", "ethereum", etc.
  role: text("role").notNull(), // e.g. "developer", "designer", etc.
  contractType: text("contract_type").notNull(), // "full-time", "part-time", "bounty"
  paymentToken: text("payment_token"), // Cryptocurrency token for payment
  createdAt: timestamp("created_at").defaultNow(),
});

// Learning resources schema
export const learningResources = pgTable("learning_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "tutorial", "challenge", "course"
  difficulty: text("difficulty").notNull(), // "beginner", "intermediate", "advanced"
  url: text("url"),
  blockchain: text("blockchain"), // Associated blockchain if any
  skills: text("skills").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Match schema with AI scoring
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  jobId: integer("job_id").notNull(),
  score: integer("score").notNull(),
  status: text("status").notNull(), // "pending", "accepted", "rejected"
  aiMatchData: jsonb("ai_match_data").default({}), // Detailed matching criteria
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  bio: true,
  skills: true,
  experience: true,
  avatar: true,
  type: true,
  walletAddress: true,
  reputation: true,
  achievements: true,
  onchainActivity: true,
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  title: true,
  company: true,
  description: true,
  requirements: true,
  salary: true,
  location: true,
  companyLogo: true,
  employerId: true,
  blockchain: true,
  role: true,
  contractType: true,
  paymentToken: true,
});

export const insertLearningResourceSchema = createInsertSchema(learningResources).pick({
  title: true,
  description: true,
  type: true,
  difficulty: true,
  url: true,
  blockchain: true,
  skills: true,
});

export const insertMatchSchema = createInsertSchema(matches).pick({
  userId: true,
  jobId: true,
  score: true,
  status: true,
  aiMatchData: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type LearningResource = typeof learningResources.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type InsertLearningResource = z.infer<typeof insertLearningResourceSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;