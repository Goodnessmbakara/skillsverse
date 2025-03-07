import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertJobSchema, insertMatchSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  });

  // Job routes
  app.post("/api/jobs", async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData);
      res.json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid job data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create job" });
      }
    }
  });

  app.get("/api/jobs", async (_req, res) => {
    const jobs = await storage.getAllJobs();
    res.json(jobs);
  });

  app.get("/api/jobs/:id", async (req, res) => {
    const job = await storage.getJob(parseInt(req.params.id));
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }
    res.json(job);
  });

  // Match routes
  app.post("/api/matches", async (req, res) => {
    try {
      const matchData = insertMatchSchema.parse(req.body);
      // Mock AI matching score calculation
      const score = Math.floor(Math.random() * 100);
      const match = await storage.createMatch({ ...matchData, score });
      res.json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid match data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create match" });
      }
    }
  });

  app.get("/api/matches/user/:userId", async (req, res) => {
    const matches = await storage.getMatchesByUser(parseInt(req.params.userId));
    res.json(matches);
  });

  app.patch("/api/matches/:id/status", async (req, res) => {
    try {
      const { status } = z.object({ status: z.string() }).parse(req.body);
      const match = await storage.updateMatchStatus(parseInt(req.params.id), status);
      res.json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid status", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update match status" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
