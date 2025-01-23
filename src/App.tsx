import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PendingApproval from './pages/PendingApproval';
import RoleSelection from './components/RoleSelection';
import ResetPassword from './pages/ResetPassword';
import { MainNavigation } from './components/MainNavigation';

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
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/"
              element={
                <MainNavigation>
                  <Routes>
                    <Route path="role-selection" element={<RoleSelection roles={[]} />} />
                    <Route path="athlete-dashboard" element={<Dashboard />} />
                    <Route path="referee-dashboard" element={<Dashboard />} />
                    <Route path="admin-dashboard" element={<Dashboard />} />
                    <Route index element={<Dashboard />} />
                  </Routes>
                </MainNavigation>
              }
            />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;