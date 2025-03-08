import { verifyCredentialOnChain, mintCredentialOnChain } from "../utils/onChain";

export async function verifyCredential(userAddress: string, credentialId: string) {
  return await verifyCredentialOnChain(userAddress, credentialId);
}

export async function mintCredential(userAddress: string, credentialData: string) {
  return await mintCredentialOnChain(userAddress, credentialData);
}