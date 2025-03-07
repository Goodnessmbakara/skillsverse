import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User profile schema
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
});

// Job listing schema
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
});

// Match schema
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  jobId: integer("job_id").notNull(),
  score: integer("score").notNull(),
  status: text("status").notNull(), // "pending", "accepted", "rejected"
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
});

export const insertMatchSchema = createInsertSchema(matches).pick({
  userId: true,
  jobId: true,
  score: true,
  status: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
