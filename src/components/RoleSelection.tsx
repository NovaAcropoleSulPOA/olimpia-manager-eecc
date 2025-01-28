import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface RoleSelectionProps {
  roles: string[];
}

export default function RoleSelection({ roles: propRoles }: RoleSelectionProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const roles = location.state?.roles || propRoles || [];
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (roles.length === 0) {
      console.error('No roles available for selection');
      toast.error('Erro ao carregar perfis disponíveis');
      navigate('/login');
    }
  }, [roles, navigate]);
  
  console.log('Available roles:', roles);

  const handleRoleSelect = async (role: string) => {
    try {
      setIsLoading(true);
      console.log('Selected role:', role);
      
      let redirectPath;
      switch (role.toLowerCase()) {
        case 'atleta':
          redirectPath = '/athlete-profile';
          break;
        case 'organizador':
          redirectPath = '/organizer-dashboard';
          break;
        case 'representante de delegação':
          redirectPath = '/delegation-dashboard';
          break;
        default:
          console.error('Invalid role selected:', role);
          toast.error('Perfil inválido selecionado');
          return;
      }
    
      toast.success(`Acessando painel de ${role.toLowerCase()}`);
      console.log('Redirecting to:', redirectPath);
      navigate(redirectPath);
    } catch (error) {
      console.error('Error selecting role:', error);
      toast.error('Erro ao selecionar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  if (roles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-olimpics-background p-4">
        <Card className="w-[400px] shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-olimpics-background p-4">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-olimpics-green-primary text-center">
            Selecione seu Perfil
          </CardTitle>
          <CardDescription className="text-center">
            Você possui múltiplos perfis. Escolha qual painel deseja acessar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {roles.map((role) => (
            <Button
              key={role}
              onClick={() => handleRoleSelect(role)}
              className="w-full bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {role}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}