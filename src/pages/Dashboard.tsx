import { useAuth } from '@/contexts/AuthContext';
import AthleteProfile from '@/components/AthleteProfile';
import PaymentInfo from '@/components/PaymentInfo';

export default function Dashboard() {
  const { user } = useAuth();

  // Only show athlete profile if user has the 'atleta' role
  const isAthlete = user?.papeis?.includes('Atleta');

  return (
    <div className="min-h-screen bg-olimpics-background">
      {isAthlete ? (
        <div className="container mx-auto py-6 space-y-6">
          <h1 className="text-2xl font-bold text-olimpics-green-primary">
            Dashboard do Atleta
          </h1>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <AthleteProfile />
            </div>
            <div className="md:col-span-1">
              <PaymentInfo />
            </div>
          </div>
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