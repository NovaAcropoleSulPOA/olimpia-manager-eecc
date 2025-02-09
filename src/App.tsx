
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './components/providers/AuthProvider';
import { Toaster } from './components/ui/sonner';
import { GlobalHeader } from './components/GlobalHeader';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import { MainNavigation } from './components/MainNavigation';
import LandingPage from './pages/LandingPage';
import Footer from './components/Footer';
import OrganizerDashboard from './components/OrganizerDashboard';
import DelegationDashboard from './components/DelegationDashboard';
import AthleteProfilePage from './components/AthleteProfilePage';
import AthleteRegistrations from './components/AthleteRegistrations';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import React from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <GlobalHeader />
            <div className="flex-1 flex flex-col mt-16">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route element={<MainNavigation />}>
                  <Route path="/athlete-profile" element={<AthleteProfilePage />} />
                  <Route path="/athlete-registrations" element={<AthleteRegistrations />} />
                  <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
                  <Route path="/delegation-dashboard" element={<DelegationDashboard />} />
                </Route>
              </Routes>
            </div>
            <Footer />
            <Toaster />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
