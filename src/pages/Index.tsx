
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  // If user is logged in, redirect to event selection
  // If not logged in, redirect to login page
  return <Navigate to={user ? "/event-selection" : "/login"} replace />;
};

export default Index;
