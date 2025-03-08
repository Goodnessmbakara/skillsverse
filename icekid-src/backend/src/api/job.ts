import express from "express";
import { getJobListings, matchJobs } from "../services/jobService";

const router = express.Router();

router.get("/", async (req, res) => {
  const jobs = await getJobListings();
  res.json(jobs);
});

router.post("/match", async (req, res) => {
  const { userId } = req.body;
  const matchedJobs = await matchJobs(userId);
  res.json(matchedJobs);
});

export default router;