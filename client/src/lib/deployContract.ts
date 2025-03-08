import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SKILLSVERSE_CONTRACT } from '@/contract/src/contract';


export async function deploySkillsVerseContract(
    signAndExecute: (args: { transactionBlock: TransactionBlock }) => Promise<any>,
    address: string
): Promise<string> {
    try {
        const tx = new TransactionBlock();

        // Compile and publish the Move module
        const [upgradeCap] = tx.publish({
            modules: [Buffer.from(SKILLSVERSE_CONTRACT).toString('base64')], // Base64 encoded contract
            dependencies: ['0x1', '0x2'], // Standard Sui dependencies (move_stdlib, sui)
        });

        // Transfer upgrade capability to the sender
        tx.transferObjects([upgradeCap], tx.pure(address));

        const result = await signAndExecute({ transactionBlock: tx });
        const packageId = result.effects?.created?.find((obj: any) => obj.owner === 'Immutable')?.reference?.objectId;
        if (!packageId) throw new Error('Failed to extract package ID');

        console.log('Contract deployed successfully. Package ID:', packageId);
        return packageId;
    } catch (error) {
        console.error('Deployment failed:', error);
        throw error;
    }
}