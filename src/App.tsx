
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AuthProvider } from './components/providers/AuthProvider';
import { MainNavigation } from './components/MainNavigation';
import Index from './pages/Index';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import AthleteProfilePage from './components/AthleteProfilePage';
import { Cronograma } from './pages/Cronograma';
import { AthleteRegistrations } from './pages/AthleteRegistrations';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { DelegationDashboard } from './pages/DelegationDashboard';
import Administration from './pages/Administration';
import { GlobalHeader } from './components/GlobalHeader';
import Footer from './components/Footer';
import { EventSelectionPage } from './pages/EventSelectionPage';
import { RejectedAccess } from './pages/RejectedAccess';
import ScoresPage from './pages/Scores';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <GlobalHeader />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/event-selection" element={<EventSelectionPage />} />
            <Route path="/rejected-access" element={<RejectedAccess />} />
            <Route element={<MainNavigation />}>
              <Route path="/athlete-profile" element={<AthleteProfilePage />} />
              <Route path="/scores" element={<ScoresPage />} />
              <Route path="/cronograma" element={<Cronograma />} />
              <Route path="/athlete-registrations" element={<AthleteRegistrations />} />
              <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
              <Route path="/delegation-dashboard" element={<DelegationDashboard />} />
              <Route path="/administration" element={<Administration />} />
            </Route>
          </Routes>
          <Footer />
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
