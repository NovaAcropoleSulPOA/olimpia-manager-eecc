import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import { GlobalHeader } from './components/GlobalHeader';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PendingApproval from './pages/PendingApproval';
import RoleSelection from './components/RoleSelection';
import ResetPassword from './pages/ResetPassword';
import { MainNavigation } from './components/MainNavigation';
import LandingPage from './pages/LandingPage';
import Footer from './components/Footer';
import OrganizerDashboard from './components/OrganizerDashboard';

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
          <GlobalHeader />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<MainNavigation />}>
              <Route path="/role-selection" element={<RoleSelection roles={[]} />} />
              <Route path="/athlete-dashboard" element={<Dashboard />} />
              <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
              <Route path="/judge-dashboard" element={<Dashboard />} />
              <Route path="/delegation-dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
          <Footer />
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;