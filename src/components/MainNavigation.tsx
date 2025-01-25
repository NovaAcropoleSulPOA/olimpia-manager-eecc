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
      console.log('Initiating logout process...');
      await signOut();
      console.log('User signed out successfully');
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

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
          <SidebarHeader className="p-6 border-b border-olimpics-green-secondary">
            <h2 className="text-xl font-bold text-center">Olimpíadas</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-center px-4 py-2 text-sm font-medium uppercase tracking-wider text-white/70">
                Navegação
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="px-3">
                  {filteredMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title} className="my-1">
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.path}
                        tooltip={item.title}
                        className={`
                          w-full rounded-lg transition-all duration-200
                          hover:bg-olimpics-green-secondary
                          ${location.pathname === item.path 
                            ? 'bg-olimpics-green-secondary shadow-lg' 
                            : 'hover:shadow-md'
                          }
                        `}
                      >
                        <Link to={item.path} className="flex items-center gap-3 p-3 justify-center">
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="mt-auto border-t border-olimpics-green-secondary p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="w-full rounded-lg p-3 flex items-center justify-center gap-3 
                    text-red-300 hover:text-red-100 hover:bg-red-500/20 
                    transition-all duration-200"
                  tooltip="Sair"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sair</span>
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