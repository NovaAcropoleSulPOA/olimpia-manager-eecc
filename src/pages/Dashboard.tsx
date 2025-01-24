import { useAuth } from '@/contexts/AuthContext';
import AthleteProfilePage from '@/components/AthleteProfilePage';

export default function Dashboard() {
  const { user } = useAuth();
  console.log("Usuário carregado no dashboard:", user);

  const isAthlete = user?.papeis?.includes('Atleta');

  return (
    <div className="min-h-screen bg-olimpics-background">
      {isAthlete ? (
        <AthleteProfilePage />
      ) : (
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold text-olimpics-green-primary">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user?.nome_completo}!
          </p>
        </div>
      )}
    </div>
  );
}