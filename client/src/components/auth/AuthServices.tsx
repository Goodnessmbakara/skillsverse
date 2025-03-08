import { generateNonce, generateRandomness } from '@mysten/zklogin';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { ConnectedWallet } from '@mysten/dapp-kit';
import suiClient from './suiClient';
import WalletManager from './WalletManager';

class AuthServices {
  async initiateProviderLogin(redirectAfterLogin = '/dashboard', provider: 'google' | 'facebook' | 'twitch' = 'google') {
    const ephemeralKeypair = new Ed25519Keypair();
    let maxEpoch;
    try {
      maxEpoch = (await suiClient.getLatestSuiSystemState()).epoch + 10;
    } catch (error) {
      console.error('Failed to fetch Sui epoch:', error);
      throw new Error('Could not connect to Sui network');
    }
    const randomness = generateRandomness();
    const nonce = generateNonce(ephemeralKeypair.getPublicKey(), maxEpoch, randomness);

    sessionStorage.setItem('ephemeralKey', JSON.stringify(ephemeralKeypair.export()));
    sessionStorage.setItem('randomness', randomness);
    sessionStorage.setItem('redirectAfterLogin', redirectAfterLogin);
    sessionStorage.setItem('loginType', 'provider');
    sessionStorage.setItem('provider', provider);

    const endpoints: Record<string, string> = {
      google: import.meta.env.VITE_GOOGLE_OPENID_URL || 'https://accounts.google.com/o/oauth2/v2/auth',
      facebook: import.meta.env.VITE_FACEBOOK_OPENID_URL || 'https://www.facebook.com/v18.0/dialog/oauth',
      twitch: import.meta.env.VITE_TWITCH_OPENID_URL || 'https://id.twitch.tv/oauth2/authorize',
    };
    const clientIds: Record<string, string> = {
      google: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      facebook: import.meta.env.VITE_FACEBOOK_CLIENT_ID,
      twitch: import.meta.env.VITE_TWITCH_CLIENT_ID,
    };

    const authUrl = `${endpoints[provider]}?client_id=${clientIds[provider]}&redirect_uri=${import.meta.env.VITE_REDIRECT_URL}&response_type=code&scope=openid%20email&nonce=${nonce}`;
    window.location.href = authUrl;
  }

  async handleProviderCallback(searchParams: URLSearchParams, navigate: (path: string) => void) {
    const code = searchParams.get('code');
    if (!code) return;

    try {
      // Simulate backend prover (replace with real backend call)
      const provider = sessionStorage.getItem('provider') || 'google';
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/auth/callback?code=${code}&provider=${provider}`);
      const { jwt, salt } = await response.json();

      WalletManager.processProviderLogin(jwt, salt);
      const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      sessionStorage.removeItem('loginType');
      sessionStorage.removeItem('provider');
      navigate(redirectTo);
    } catch (error) {
      console.error('Callback error:', error);
      navigate('/login?error=auth_failed');
    }
  }

  initiateWalletLogin() {
    sessionStorage.setItem('loginType', 'wallet');
  }

  isAuthenticated(): boolean {
    return WalletManager.isAuthenticated();
  }

  logout(navigate: (path: string) => void) {
    WalletManager.logout();
    sessionStorage.clear();
    navigate('/');
  }
}

export default new AuthServices();