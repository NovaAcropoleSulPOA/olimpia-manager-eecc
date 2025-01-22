import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import AthleteDashboard from './pages/AthleteDashboard';
import PendingApproval from './pages/PendingApproval';
import RejectedAccess from './pages/RejectedAccess';
import VerifyEmail from './pages/VerifyEmail';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/judge-dashboard" element={<JudgeDashboard />} />
            <Route path="/athlete-dashboard" element={<AthleteDashboard />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/rejected-access" element={<RejectedAccess />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;