import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';

function JobsCreate() {
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();

    const postJob = async () => {
        // Upload description to Walrus (mock API call)
        const description = "Build a dApp";
        const walrusUrl = await uploadToWalrus(description); // Implement this

        const tx = new TransactionBlock();
        const [coin] = tx.splitCoins(tx.gas, [tx.pure(1000000000)]);
        tx.moveCall({
            target: '0xYourPackageId::marketplace::post_job',
            arguments: [
                tx.pure(b, "Web Developer"),
                tx.pure(walrusUrl),
                coin,
            ],
        });
        signAndExecute({ transactionBlock: tx }, { onSuccess: () => console.log('Job posted') });
    };

    async function uploadToWalrus(data: string): Promise<Uint8Array> {
        // Placeholder: Replace with actual Walrus API call
        return new TextEncoder().encode(`https://walrus.storage/${data}`);
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Jobs</h1>
            <button onClick={postJob}>Post Job</button>
        </div>
    );
}

export default JobsCreate;