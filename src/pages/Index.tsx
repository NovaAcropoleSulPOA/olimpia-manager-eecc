
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  return <Navigate to={user ? "/event-selection" : "/login"} replace />;
};

export default Index;
