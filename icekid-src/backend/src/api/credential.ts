import express from "express";
import { verifyCredential, mintCredential } from "../services/credentialService";

const router = express.Router();

router.post("/verify", async (req, res) => {
  const { userAddress, credentialId } = req.body;
  const result = await verifyCredential(userAddress, credentialId);
  res.json(result);
});

router.post("/mint", async (req, res) => {
  const { userAddress, credentialData } = req.body;
  const result = await mintCredential(userAddress, credentialData);
  res.json(result);
});

export default router;