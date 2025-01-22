import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import './App.css';
import Login from './pages/Login';
import PendingApproval from './pages/PendingApproval';
import RoleSelection from './components/RoleSelection';
import AthleteDashboard from './pages/athlete/AthleteDashboard';
import RefereeDashboard from './pages/referee/RefereeDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <main>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/pending-approval" element={<PendingApproval />} />
              <Route path="/role-selection" element={<RoleSelection roles={[]} />} />
              <Route path="/athlete-dashboard" element={<AthleteDashboard />} />
              <Route path="/referee-dashboard" element={<RefereeDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/" element={<Login />} />
            </Routes>
          </main>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;