import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import dotenv from "dotenv";

dotenv.config();

// Initialize the SUI client
const client = new SuiClient({
  url: getFullnodeUrl(process.env.SUI_NETWORK || "testnet"),
});

// Example keypair for signing (replace with your actual keypair)
const keypair = new Ed25519Keypair();

export async function verifyCredentialOnChain(userAddress: string, credentialId: string): Promise<any> {
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
    transactionBlock: signedTx.transactionBlockBytes,
    signature: signedTx.signature,
    options: {
      showEffects: true,
    },
  });

  return result;
}

export async function mintCredentialOnChain(userAddress: string, credentialData: string): Promise<any> {
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
    transactionBlock: signedTx.transactionBlockBytes,
    signature: signedTx.signature,
    options: {
      showEffects: true,
    },
  });

  return result;
}