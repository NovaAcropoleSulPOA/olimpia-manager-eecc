import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Flag } from 'lucide-react';

export default function RefereeDashboard() {
  const { signOut, user } = useAuth();

  console.log('Rendering referee dashboard for user:', user?.id);

  return (
    <div className="min-h-screen bg-olimpics-background">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-olimpics-green-primary">
            Dashboard do Juiz
          </h1>
          <Button variant="ghost" onClick={signOut} className="text-olimpics-orange-primary">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-olimpics-green-primary" />
              Painel do Juiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Bem-vindo ao painel do juiz. Aqui você poderá gerenciar as pontuações e resultados das competições.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}