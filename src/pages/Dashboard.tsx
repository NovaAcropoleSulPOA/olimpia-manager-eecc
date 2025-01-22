import { useAuth } from '@/contexts/AuthContext';
import AthleteProfile from '@/components/AthleteProfile';

export default function Dashboard() {
  const { user } = useAuth();

  // Only show athlete profile if user has the 'atleta' role
  const isAthlete = user?.papeis?.includes('Atleta');

  return (
    <div className="min-h-screen bg-background">
      {isAthlete ? (
        <AthleteProfile />
      ) : (
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user?.nome_completo}!
          </p>
        </div>
      )}
    </div>
  );
}