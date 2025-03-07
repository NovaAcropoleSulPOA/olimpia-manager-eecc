
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from './LandingPage';

const Index = () => {
  const { user } = useAuth();
  
  // If user is authenticated, navigate to their dashboard
  if (user) {
    return <Navigate to="/home" replace />;
  }
  
  // If user is not authenticated, show the landing page
  return <LandingPage />;
};

export default Index;
