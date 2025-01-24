import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator
} from './ui/sidebar';
import { 
  User, 
  Medal, 
  Users, 
  BarChart3, 
  LogOut,
  Home,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function MainNavigation() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  // Define all possible menu items with their roles
  const menuItems = [
    {
      title: "Início",
      icon: Home,
      path: "/dashboard",
      roles: ["Atleta", "Juiz", "Organizador", "Rep. de Delegação"],
      description: "Página inicial"
    },
    {
      title: "Perfil do Atleta",
      icon: User,
      path: "/athlete-profile",
      roles: ["Atleta"],
      description: "Gerencie seu perfil de atleta"
    },
    {
      title: "Área do Organizador",
      icon: BarChart3,
      path: "/organizer-dashboard",
      roles: ["Organizador"],
      description: "Acesse o painel de controle do organizador"
    },
    {
      title: "Área do Juiz",
      icon: Medal,
      path: "/judge-dashboard",
      roles: ["Juiz"],
      description: "Gerencie avaliações e pontuações"
    },
    {
      title: "Área da Delegação",
      icon: Users,
      path: "/delegation-dashboard",
      roles: ["Rep. de Delegação"],
      description: "Gerencie sua delegação"
    },
    {
      title: "Configurações",
      icon: Settings,
      path: "/settings",
      roles: ["Atleta", "Juiz", "Organizador", "Rep. de Delegação"],
      description: "Configurações da conta"
    }
  ];

  // Filter menu items based on user roles
  const availableMenuItems = menuItems.filter(item => 
    item.roles.some(role => user?.papeis?.includes(role))
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="bg-olimpics-green-primary text-white transition-all duration-200">
          <SidebarContent>
            <div className="px-4 py-6">
              <h2 className="text-lg font-semibold text-white">Olimpíadas</h2>
              <p className="text-sm text-white/70">Bem-vindo, {user?.nome_completo}</p>
            </div>
            <SidebarMenu>
              {availableMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.description}
                    className="hover:bg-olimpics-green-secondary"
                  >
                    <Link to={item.path} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarSeparator />
            <div className="px-4 py-2">
              <p className="text-sm text-white/70 mb-2">Seus perfis:</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {user?.papeis?.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-white/10"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="text-red-300 hover:text-red-100 hover:bg-red-900/20"
                  tooltip="Sair da aplicação"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 p-6 bg-olimpics-background">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}