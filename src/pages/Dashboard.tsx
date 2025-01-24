import { useAuth } from '@/contexts/AuthContext';
import AthleteProfile from '@/components/AthleteProfile';

export default function Dashboard() {
  const { user } = useAuth();

  console.log("Usuário carregado no dashboard:", user);

  const isAthlete = user?.papeis?.includes('Atleta');

  return (
    <div className="min-h-screen bg-olimpics-background">
      {isAthlete ? (
        <div className="container mx-auto py-6 space-y-6">
          <h1 className="text-2xl font-bold text-olimpics-green-primary">
            Dashboard do Atleta
          </h1>
          <AthleteProfile />
        </div>
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