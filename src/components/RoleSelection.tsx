import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface RoleSelectionProps {
  roles: string[];
}

export default function RoleSelection({ roles: propRoles }: RoleSelectionProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const roles = location.state?.roles || propRoles || [];

  if (roles.length === 0) {
    console.error('No roles available for selection');
    toast.error('Erro ao carregar perfis disponíveis');
    navigate('/login');
    return null;
  }
  
  console.log('Available roles:', roles);

  const handleRoleSelect = (role: string) => {
    console.log('Perfil selecionado:', role);
    let redirectPath = '/dashboard';
  
    switch (role) {
      case 'Atleta':
        redirectPath = '/athlete-dashboard';
        break;
      case 'Juiz':
        redirectPath = '/referee-dashboard';
        break;
      case 'Organizador':
        redirectPath = '/admin-dashboard';
        break;
    }
  
    toast.success(`Acessando painel de ${role.toLowerCase()}`);
    console.log('Redirecionando para:', redirectPath);
    navigate(redirectPath);
  };  

  if (!roles || roles.length === 0) {
    console.error('No roles available for selection');
    toast.error('Erro ao carregar perfis disponíveis');
    navigate('/login');
    return null;
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
            >
              {role}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}