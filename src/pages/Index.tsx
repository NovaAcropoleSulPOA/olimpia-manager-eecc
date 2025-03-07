
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from './LandingPage';

const Index = () => {
  const { user } = useAuth();
  
  // If user is authenticated, navigate to their appropriate dashboard based on roles
  // If not authenticated, show the landing page
  if (user) {
    return <Navigate to="/home" replace />;
  }
  
  return <LandingPage />;
};

export default Index;
