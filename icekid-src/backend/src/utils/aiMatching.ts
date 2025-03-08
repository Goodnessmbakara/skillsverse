import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize the SUI client
const client = new SuiClient({
  url: getFullnodeUrl(process.env.SUI_NETWORK || "testnet"),
});

// Example keypair for signing (replace with your actual keypair)
const keypair = new Ed25519Keypair();

// Verify credential endpoint
app.post("/api/verify-credential", async (req, res) => {
  const { userAddress, credentialId } = req.body;

  try {
    const tx = new TransactionBlock();

    // Build the transaction to verify the credential
    tx.moveCall({
      target: "0xCREDENTIAL_VERIFICATION_PACKAGE_ID::credential_verification::verify_credential",
      arguments: [tx.pure(userAddress), tx.pure(credentialId)],
    });

    // Serialize the transaction block
    const serializedTx = await tx.build({ client });

    // Sign the transaction
    const signedTx = await keypair.signTransactionBlock(serializedTx);

    // Execute the transaction
    const result = await client.executeTransactionBlock({
      transactionBlock: serializedTx, // Use the serialized transaction block
      signature: signedTx.signature,
      options: {
        showEffects: true,
      },
    });

    res.json(result);
  } catch (error) {
    console.error("Error verifying credential:", error);
    res.status(500).json({ error: "Failed to verify credential" });
  }
});

// Mint credential endpoint
app.post("/api/mint-credential", async (req, res) => {
  const { userAddress, credentialData } = req.body;

  try {
    const tx = new TransactionBlock();

    // Build the transaction to mint the credential
    tx.moveCall({
      target: "0xCREDENTIAL_MINTING_PACKAGE_ID::credential_minting::mint_credential",
      arguments: [tx.pure(userAddress), tx.pure(credentialData)],
    });

    // Serialize the transaction block
    const serializedTx = await tx.build({ client });

    // Sign the transaction
    const signedTx = await keypair.signTransactionBlock(serializedTx);

    // Execute the transaction
    const result = await client.executeTransactionBlock({
      transactionBlock: serializedTx, // Use the serialized transaction block
      signature: signedTx.signature,
      options: {
        showEffects: true,
      },
    });

    res.json(result);
  } catch (error) {
    console.error("Error minting credential:", error);
    res.status(500).json({ error: "Failed to mint credential" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});