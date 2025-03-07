
import { useAuth } from '@/contexts/AuthContext';
import AthleteProfilePage from '@/components/AthleteProfilePage';
import OrganizerDashboard from '@/components/OrganizerDashboard';
import DelegationDashboard from '@/components/DelegationDashboard';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  console.log("Usuário carregado no dashboard:", user);

  const isAthlete = user?.papeis?.some(role => role.codigo === 'ATL');
  const isOrganizer = user?.papeis?.some(role => role.codigo === 'ORE');
  const isDelegationRep = user?.papeis?.some(role => role.codigo === 'RDD');

  if (isAthlete) {
    return <AthleteProfilePage />;
  } else if (isOrganizer) {
    return <Navigate to="/organizer-dashboard" replace />;
  } else if (isDelegationRep) {
    return <Navigate to="/delegation-dashboard" replace />;
  } else {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold text-olimpics-green-primary">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {user?.nome_completo}!
        </p>
      </div>
    );
  }
}
