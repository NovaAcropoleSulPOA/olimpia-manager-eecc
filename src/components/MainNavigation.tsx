import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel
} from './ui/sidebar';
import { Home, User, Medal, Users, Award, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function MainNavigation() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Início",
      icon: Home,
      path: "/athlete-dashboard",
      roles: ["Atleta", "Juiz", "Organizador", "Rep. de Delegação"]
    },
    {
      title: "Perfil do Atleta",
      icon: Award,
      path: "/athlete-dashboard",
      roles: ["Atleta"]
    },
    {
      title: "Área do Organizador",
      icon: BarChart3,
      path: "/organizer-dashboard",
      roles: ["Organizador"]
    },
    {
      title: "Área do Juiz",
      icon: Medal,
      path: "/judge-dashboard",
      roles: ["Juiz"]
    },
    {
      title: "Área da Delegação",
      icon: Users,
      path: "/delegation-dashboard",
      roles: ["Rep. de Delegação"]
    }
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  // Filter menu items based on user roles
  const userRoles = user?.papeis || [];
  console.log('User roles:', userRoles);
  
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.some(role => userRoles.includes(role))
  );
  console.log('Filtered menu items:', filteredMenuItems);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="bg-olimpics-green-primary text-white transition-all duration-300">
          <SidebarHeader className="p-4">
            <h2 className="text-lg font-bold">Olimpíadas</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navegação</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.path}
                        tooltip={item.title}
                        className="transition-colors duration-200 hover:bg-olimpics-green-secondary"
                      >
                        <Link to={item.path} className="flex items-center gap-2 p-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="text-red-300 hover:text-red-100 transition-colors duration-200"
                  tooltip="Sair"
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