import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Transaction } from '@mysten/sui/transactions';

const client = new SuiClient({ url: getFullnodeUrl('testnet') });
const WALRUS_API = 'https://testnet.walrus.storage'; // Placeholder; update with actual Testnet endpoint

export async function uploadToWalrus(
    data: string,
    signAndExecute: (args: { transactionBlock: Transaction }) => Promise<any>,
    address: string
): Promise<Uint8Array> {
    try {
        // Step 1: Upload blob to Walrus
        const response = await fetch(`${WALRUS_API}/store`, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: data,
        });
        if (!response.ok) throw new Error('Failed to upload to Walrus');
        const blobId = await response.text(); // Returns blob ID (e.g., "blob_123")

        // Step 2: Certify blob availability on Sui (optional, depends on use case)
        const tx = new Transaction();
        // Placeholder: Walrus contracts not fully public yet; assume a certify function
        // tx.moveCall({
        //   target: '0xWalrusPackageId::storage::certify_blob',
        //   arguments: [tx.pure(blobId)],
        // });
        await signAndExecute({ transactionBlock: tx });

        // Step 3: Return blob URL as bytes for Move
        const blobUrl = `https://walrus.storage/${blobId}`;
        return new TextEncoder().encode(blobUrl);
    } catch (error) {
        console.error('Walrus upload failed:', error);
        throw error;
    }
}

export async function retrieveFromWalrus(blobUrl: string): Promise<string> {
    const blobId = blobUrl.split('/').pop();
    const response = await fetch(`${WALRUS_API}/retrieve/${blobId}`);
    if (!response.ok) throw new Error('Failed to retrieve from Walrus');
    return response.text();
}