import { jwtToAddress } from '@mysten/zklogin';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { ConnectedWallet } from '@mysten/dapp-kit';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

class WalletManager {
    private jwt: string | null = null;
    private address: string | null = null;
    private ephemeralKeypair: Ed25519Keypair | null = null;
    private wallet: ConnectedWallet | null = null;
    private suiClient: SuiClient = new SuiClient({ url: getFullnodeUrl('mainnet') });

    constructor() {
        this.rehydrateState();
    }

    private rehydrateState() {
        const loginType = sessionStorage.getItem('loginType');
        if (loginType === 'provider') {
            const jwt = sessionStorage.getItem('jwt');
            const salt = sessionStorage.getItem('salt');
            const storedKey = sessionStorage.getItem('ephemeralKey');
            if (jwt && salt) {
                this.jwt = jwt;
                this.address = jwtToAddress(jwt, salt);
            }
            if (storedKey) {
                this.ephemeralKeypair = Ed25519Keypair.fromSecretKey(
                    Uint8Array.from(JSON.parse(storedKey).privateKey)
                );
            }
        } else if (loginType === 'wallet') {
            const walletAddress = sessionStorage.getItem('walletAddress');
            if (walletAddress) {
                this.address = walletAddress;
            }
        }
    }

    processProviderLogin(jwt: string, salt: string) {
        this.jwt = jwt;
        this.address = jwtToAddress(jwt, salt);
        sessionStorage.setItem('jwt', jwt);
        sessionStorage.setItem('salt', salt);
        const storedKey = sessionStorage.getItem('ephemeralKey');
        if (storedKey) {
            this.ephemeralKeypair = Ed25519Keypair.fromSecretKey(
                Uint8Array.from(JSON.parse(storedKey).privateKey)
            );
        }
    }

    processWalletLogin(wallet: ConnectedWallet) {
        this.wallet = wallet;
        this.address = wallet.accounts[0]?.address || null;
        if (this.address) {
            sessionStorage.setItem('walletAddress', this.address);
        }
    }

    isAuthenticated(): boolean {
        this.rehydrateState();
        const loginType = sessionStorage.getItem('loginType');
        if (loginType === 'provider') {
            return !!this.address && !!this.jwt;
        } else if (loginType === 'wallet') {
            return !!this.address;
        }
        return false;
    }

    getAddress(): string | null {
        this.rehydrateState();
        return this.address;
    }

    async getSuiNSName(): Promise<string | null> {
        this.rehydrateState();
        if (!this.address) return null;
        try {
            const response = await this.suiClient.call('suix_resolveNameServiceNames', [this.address]);
            return response?.data?.[0] || null;
        } catch (error) {
            console.error('Error fetching SuiNS:', error);
            return null;
        }
    }

    logout() {
        this.jwt = null;
        this.address = null;
        this.ephemeralKeypair = null;
        this.wallet = null;
        sessionStorage.clear();
    }
}

export default new WalletManager();