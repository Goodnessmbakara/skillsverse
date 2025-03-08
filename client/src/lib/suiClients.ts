import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
const url = import.meta.env.VITE_SUI_FULLNODE_URL;

// Create a SuiClient instance for Testnet
// export const client = new SuiClient({
//     url: getFullnodeUrl('testnet'),
// });

// Create a SuiClient instance for Mainnet
// export const suiClientMainnet = new SuiClient({
//     url: getFullnodeUrl('mainnet'),
// });


if (!url) {
  throw new Error('VITE_SUI_FULLNODE_URL is not defined in .env');
}

// const suiClient = new SuiClient({ url });

const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

export default suiClient;