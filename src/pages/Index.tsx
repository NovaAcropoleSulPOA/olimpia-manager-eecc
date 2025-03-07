
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from './LandingPage';

const Index = () => {
  const { user } = useAuth();
  
  console.log('Index component - User auth state:', user ? 'Authenticated' : 'Not authenticated');
  
  // If user is authenticated, navigate to their dashboard
  if (user) {
    console.log('User is authenticated, redirecting to /home');
    return <Navigate to="/home" replace />;
  }
  
  // If user is not authenticated, show the landing page
  console.log('User is not authenticated, displaying landing page');
  return <LandingPage />;
};

export default Index;
