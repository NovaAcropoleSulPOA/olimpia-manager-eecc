import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import { GlobalHeader } from './components/GlobalHeader';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import PendingApproval from './pages/PendingApproval';
import ResetPassword from './pages/ResetPassword';
import { MainNavigation } from './components/MainNavigation';
import LandingPage from './pages/LandingPage';
import Footer from './components/Footer';
import OrganizerDashboard from './components/OrganizerDashboard';
import AthleteProfilePage from './components/AthleteProfilePage';
import AthleteRegistrations from './components/AthleteRegistrations';
import { useState } from 'react';
import React from 'react';

function App() {
  // Initialize queryClient with useState to ensure stable reference
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <GlobalHeader />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/pending-approval" element={<PendingApproval />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route element={<MainNavigation />}>
                    <Route path="/athlete-profile" element={<AthleteProfilePage />} />
                    <Route path="/athlete-registrations" element={<AthleteRegistrations />} />
                    <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
                  </Route>
                </Routes>
              </div>
              <Footer />
              <Toaster />
            </div>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;