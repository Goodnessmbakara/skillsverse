import React, { useState } from 'react';
import 'react'; // Ensure React is properly loaded first
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
  const [initialized, setInitialized] = React.useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      {initialized && (
        <SuiClientProvider
          networks={{ testnet: { url: getFullnodeUrl('testnet') } }}
          defaultNetwork="testnet"
        >
          <WalletProvider>
            <Router>
              <Navigation />
              <main className="container mx-auto p-4 mt-6 mb-20">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  
                  {/* Protected routes */}
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } />
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/jobs/create" element={
                    <PrivateRoute>
                      <JobsCreate />
                    </PrivateRoute>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </Router>
          </WalletProvider>
        </SuiClientProvider>
      )}
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;