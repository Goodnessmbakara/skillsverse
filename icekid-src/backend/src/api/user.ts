import express from "express";
import { getUserProfile, updateUserProfile } from "../services/userService";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  const user = await getUserProfile(userId);
  res.json(user);
});

router.post("/:id", async (req, res) => {
  const userId = req.params.id;
  const profileData = req.body;
  const updatedUser = await updateUserProfile(userId, profileData);
  res.json(updatedUser);
});

export default router;