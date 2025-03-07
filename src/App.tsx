
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import './App.css';

// Import pages
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrganizerDashboard from './components/OrganizerDashboard';
import DelegationDashboard from './components/DelegationDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import EventSelectionPage from './pages/EventSelectionPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import RejectedAccess from './pages/RejectedAccess';
import LandingPage from './pages/LandingPage';
import Scores from './pages/Scores';
import Cronograma from './pages/Cronograma';
import Administration from './pages/Administration';

// Import providers and components
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './components/providers/AuthProvider';
import { MobileNavigationLink } from './components/footer/MobileNavigation';
import Footer from './components/Footer';
import { MainNavigation } from './components/MainNavigation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/esqueci-senha" element={<ForgotPassword />} />
              <Route path="/redefinir-senha" element={<ResetPassword />} />
              <Route path="/verificar-email" element={<VerifyEmail />} />
              <Route path="/acesso-negado" element={<RejectedAccess />} />
              <Route path="/home" element={<Dashboard />} />
              <Route path="/event-selection" element={<EventSelectionPage />} />
              
              {/* Authenticated routes with sidebar */}
              <Route element={<MainNavigation />}>
                <Route path="/athlete-profile" element={<Dashboard />} />
                <Route path="/delegation-dashboard" element={<DelegationDashboard />} />
                <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
                <Route path="/scores" element={<Scores />} />
                <Route path="/cronograma" element={<Cronograma />} />
                <Route path="/administration" element={<Administration />} />
                <Route path="/judge-dashboard" element={<JudgeDashboard />} />
              </Route>
            </Routes>
            <Footer />
            <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
              <MobileNavigationLink />
            </div>
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

export default App;
