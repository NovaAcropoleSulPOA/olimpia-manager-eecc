import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import './App.css';
import Login from './pages/Login';
import AthleteDashboard from './pages/AthleteDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import AdminDashboard from './pages/AdminDashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <main>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/athlete-dashboard" element={<AthleteDashboard />} />
              <Route path="/judge-dashboard" element={<JudgeDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;