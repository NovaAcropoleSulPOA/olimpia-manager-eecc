import { Home, User, LogOut, Menu } from 'lucide-react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function MainNavigation() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const getDefaultRoute = () => {
    if (!user?.papeis?.length) return '/login';
    const role = user.papeis[0];
    switch (role) {
      case 'Atleta':
        return '/athlete-dashboard';
      case 'Juiz':
        return '/referee-dashboard';
      case 'Organizador':
        return '/admin-dashboard';
      default:
        return '/login';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <h2 className="text-lg font-semibold text-olimpics-green-primary">
              Olimpíadas RS 2025
            </h2>
          </SidebarHeader>
          <SidebarContent>
            <nav className="space-y-2 p-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate(getDefaultRoute())}
              >
                <Home className="mr-2 h-4 w-4" />
                Início
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate(-1)}
              >
                ⬅ Voltar
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate('/role-selection')}
              >
                <User className="mr-2 h-4 w-4" />
                Trocar Perfil
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </nav>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="text-sm text-muted-foreground">
              {user?.nome_completo}
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 bg-white border-b">
            <SidebarTrigger asChild>
              <Button variant="ghost" size="icon" className="m-2">
                <Menu className="h-4 w-4" />
              </Button>
            </SidebarTrigger>
          </div>
          <div className="p-4">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}