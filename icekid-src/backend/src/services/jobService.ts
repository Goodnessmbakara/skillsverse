import { getJobListingsFromDB } from "../models/jobModel";
import { matchUserToJob } from "../utils/aiMatching";
import { getUserProfile } from "./userService";

export async function getJobListings() {
  return await getJobListingsFromDB();
}

export async function matchJobs(userId: string) {
  const userProfile = await getUserProfile(userId); // Assume this function exists
  const jobs = await getJobListings();
  const matchedJobs = await Promise.all(
    jobs.map(async (job: { description: string; }) => {
      const matchScore = await matchUserToJob(userProfile, job.description);
      return { ...job, matchScore };
    })
  );
  return matchedJobs.sort((a: { matchScore: number; }, b: { matchScore: number; }) => b.matchScore - a.matchScore);
}