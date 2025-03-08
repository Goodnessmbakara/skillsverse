import { SuiClient } from '@mysten/sui.js/client';

const url = import.meta.env.VITE_SUI_FULLNODE_URL;
if (!url) {
  throw new Error('VITE_SUI_FULLNODE_URL is not defined in .env');
}

const suiClient = new SuiClient({ url });
export default suiClient;