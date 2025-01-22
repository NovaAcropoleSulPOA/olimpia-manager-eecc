import AthleteProfile from '@/components/AthleteProfile';
import PaymentInfo from '@/components/PaymentInfo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function AthleteDashboard() {
  const { signOut, user } = useAuth();

  console.log('Rendering athlete dashboard for user:', user?.id);

  return (
    <div className="min-h-screen bg-olimpics-background">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-olimpics-green-primary">
            Dashboard do Atleta
          </h1>
          <Button variant="ghost" onClick={signOut} className="text-olimpics-orange-primary">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <AthleteProfile />
          </div>
          <div className="md:col-span-1">
            <PaymentInfo />
          </div>
        </div>
      </main>
    </div>
  );
}