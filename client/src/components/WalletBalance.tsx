import { useEffect, useState } from 'react';
import { ConnectModal, useCurrentWallet, useDisconnectWallet } from '@mysten/dapp-kit';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Button } from './ui/button';
import { LogIn, LogOut, Wallet } from 'lucide-react';
import AuthServices from './auth/AuthServices';
import { Link, useNavigate } from 'react-router-dom';

function WalletBalance() {
    const navigate = useNavigate();
    const { connectionStatus, currentWallet } = useCurrentWallet();
    const [balance, setBalance] = useState<string>('0');

    const isAuthenticated = AuthServices.isAuthenticated();

    const handleConnectWallet = async () => {
        try {
            console.log('clicke')
            // await connect();
            // Optionally navigate or perform other actions after connection
            navigate('/dashboard');
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Failed to connect wallet. Please try again.');
        }
    };
    const { mutate: disconnect } = useDisconnectWallet();


    useEffect(() => {
        if (connectionStatus === 'connected' && currentWallet) {
            const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
            const address = currentWallet.accounts[0].address;
            client.getBalance({ owner: address }).then((balance: { totalBalance: string }) => {
                setBalance(balance.totalBalance);
            });
        }
    }, [connectionStatus, currentWallet]);

    return (
        <>
            {isAuthenticated ? (
                <Button
                    variant="ghost"
                    className="gap-2"
                    onClick={() => {
                        AuthServices.logout(navigate)
                        disconnect()
                    }}
                >
                    <LogOut size={20} />
                    Logout
                </Button>
            ) : (
                <Button
                    variant={location.pathname === "/login" ? "default" : "ghost"}
                    className="gap-2"
                    onClick={() => navigate('/login')}
                >
                    <LogIn size={20} />
                    Login
                </Button>
            )}

        </>
    );
}

export default WalletBalance;