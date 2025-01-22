import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function PendingApproval() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-olimpics-background">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-olimpics-green-primary text-center">
            Cadastro em Análise
          </CardTitle>
          <CardDescription className="text-center text-olimpics-text">
            Seu cadastro está sendo analisado pelos organizadores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Clock className="h-12 w-12 text-olimpics-green-primary" />
          </div>
          <p className="text-center text-sm text-gray-600">
            Aguarde enquanto os organizadores analisam seu cadastro.
            Você receberá um email quando seu acesso for liberado.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              signOut();
              navigate('/login');
            }}
            className="w-full"
          >
            Voltar para Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}