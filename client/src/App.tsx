import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { queryClient } from './lib/queryClient';
import Navigation from '@/components/navigation';
import Home from '@/pages/home';
import Jobs from '@/pages/jobs';
import Profile from '@/pages/profile';
import Dashboard from '@/pages/dashboard';
import Login from './pages/login';
import NotFound from '@/pages/not-found';
import PrivateRoute from './components/PrivateRoute';
import AuthCallback from './components/auth/AuthCallbackt';

import '@mysten/dapp-kit/dist/index.css';
import JobsCreate from './pages/JobsCreate';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={{ testnet: { url: getFullnodeUrl('testnet') } }}
        defaultNetwork="testnet"
      >
        <WalletProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/jobs/create"
                    element={
                      <PrivateRoute>
                        <JobsCreate />
                      </PrivateRoute>
                    }
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
            <Toaster />
          </Router>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;