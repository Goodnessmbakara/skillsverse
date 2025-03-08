import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

// Create a SuiClient instance for Testnet
export const client = new SuiClient({
    url: getFullnodeUrl('testnet'),
});

// Create a SuiClient instance for Mainnet
// export const suiClientMainnet = new SuiClient({
//     url: getFullnodeUrl('mainnet'),
// });
