import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Briefcase, User, LayoutDashboard } from "lucide-react";
import { ConnectButton, useCurrentWallet } from '@mysten/dapp-kit';
import WalletManager from './auth/WalletManager';
import AuthServices from './auth/AuthServices';
import WalletBalance from './WalletBalance';

import Logo from '@/assets/generated-icon.png';

export default function Navigation() {
  const location = useLocation();
  const { isConnected, currentWallet } = useCurrentWallet(); // Remove 'connect' here
  const isAuthenticated = AuthServices.isAuthenticated();

  // Handle wallet connection
  if (isConnected && currentWallet && !WalletManager.getAddress()) {
    WalletManager.processWalletLogin(currentWallet);
    AuthServices.initiateWalletLogin();
  }

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button
              variant="link"
              className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text p-0"
            >
              <img src={Logo} alt="" className='w-10 lg:w-20'/>
              SkillsVerse
            </Button>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/jobs">
              <Button
                variant={location.pathname === "/jobs" ? "default" : "ghost"}
                className="gap-2"
              >
                <Briefcase size={20} />
                Jobs
              </Button>
            </Link>

            {/* Only show Profile and Dashboard when authenticated */}
            {isAuthenticated && (
              <>
                <Link to="/profile">
                  <Button
                    variant={location.pathname === "/profile" ? "default" : "ghost"}
                    className="gap-2"
                  >
                    <User size={20} />
                    Profile
                  </Button>
                </Link>

                <Link to="/dashboard">
                  <Button
                    variant={location.pathname === "/dashboard" ? "default" : "ghost"}
                    className="gap-2"
                  >
                    <LayoutDashboard size={20} />
                    Dashboard
                  </Button>
                </Link>
              </>
            )}

            <WalletBalance />
          </div>
        </div>
      </div>
    </nav>
  );
}