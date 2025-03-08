import AuthServices from '@/components/auth/AuthServices';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, Wallet } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ConnectButton, useCurrentWallet } from '@mysten/dapp-kit';
import WalletManager from '@/components/auth/WalletManager';
import { toast } from '@/hooks/use-toast';

function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentWallet, isConnected } = useCurrentWallet();
    const [debugInfo, setDebugInfo] = useState({
        buttonClicked: 0,
        connectionAttempts: 0,
        errors: [],
        lastEvent: null,
    });

    // Handle wallet connection
    useEffect(() => {
        if (isConnected && currentWallet) {
            WalletManager.processWalletLogin(currentWallet);
            AuthServices.initiateWalletLogin();

            navigate('/dashboard');
        } else if (WalletManager.isAuthenticated()) {
            navigate('/dashboard');
        }
    }, [isConnected, currentWallet, navigate]);

    // Handle zkLogin callback
    useEffect(() => {
        if (searchParams.get('code')) {
            AuthServices.handleProviderCallback(searchParams, navigate);
        } else if (searchParams.get('error')) {
            //    toast({up}) //TODO: fix toast to alert auth failure
        }
    }, [searchParams, navigate]);

    const handleProviderLogin = (provider: 'google' | 'facebook' | 'twitch') => {
        console.log(`${provider} login initiated`);
        AuthServices.initiateProviderLogin('/dashboard', provider);
    };

    return (
        <div className="p-6">
            <div className="h-[70dvh] flex items-center justify-center">
                <div className="max-w-xl mx-auto">
                    <h1 className="text-2xl font-bold mb-4">Welcome to SkillsVerse</h1>
                    <p className="mb-6">Log in to start finding or posting jobs.</p>

                    <div className="space-y-4">
                        <div className="relative group w-full">
                            <Button
                                onClick={() => handleProviderLogin('google')}
                                disabled={true}
                                className="w-full gap-2"
                            >
                                <LogIn size={20} /> Login with Google
                            </Button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                This login method is currently unavailable
                            </div>
                        </div>
                        <Button onClick={() => handleProviderLogin('facebook')} disabled={true} className="w-full gap-2">
                            <LogIn size={20} /> Login with Facebook
                        </Button>
                        <Button onClick={() => handleProviderLogin('twitch')} disabled={true} className="w-full gap-2 cursor-not-allowed">
                            <LogIn size={20} /> Login with Twitch
                        </Button>
                        <ConnectButton
                            className="w-full"
                            connectText={<><Wallet size={20} className="mr-2" /> Connect Wallet</>}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;