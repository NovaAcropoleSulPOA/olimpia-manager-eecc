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
  SidebarGroupLabel,
  SidebarTrigger
} from './ui/sidebar';
import { User, BarChart3, LogOut, Menu, ClipboardList, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function MainNavigation() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userRoles = user?.papeis || [];
  const isOrganizer = userRoles.includes('Organizador');
  const isAthlete = userRoles.includes('Atleta');
  const isDelegationRep = userRoles.includes('Representante de Delegação');

  useEffect(() => {
    if (location.pathname === '/') {
      console.log('MainNavigation - Initial navigation based on roles');
      if (isAthlete) {
        navigate('/athlete-profile');
      } else if (isOrganizer) {
        navigate('/organizer-dashboard');
      } else if (isDelegationRep) {
        navigate('/delegation-dashboard');
      }
    }
  }, [isAthlete, isOrganizer, isDelegationRep, location.pathname, navigate]);

  const handleLogout = async () => {
    try {
      console.log('MainNavigation - Initiating logout process...');
      await signOut();
      console.log('MainNavigation - User signed out successfully');
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('MainNavigation - Error during logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const menuItems = [
    ...(isAthlete ? [
      {
        title: "Perfil do Atleta",
        icon: User,
        path: "/athlete-profile"
      },
      {
        title: "Minhas Inscrições",
        icon: ClipboardList,
        path: "/athlete-registrations"
      }
    ] : []),
    ...(isOrganizer ? [
      {
        title: "Organizador(a)",
        icon: BarChart3,
        path: "/organizer-dashboard"
      }
    ] : []),
    ...(isDelegationRep ? [
      {
        title: "Dashboard da Delegação",
        icon: Users,
        path: "/delegation-dashboard"
      }
    ] : [])
  ];

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-[calc(100vh-4rem)] w-full">
        <Sidebar className="fixed left-0 top-16 bottom-16 z-40 w-64 bg-olimpics-green-primary text-white transition-all duration-300">
          <div className="flex flex-col h-full">
            <SidebarHeader className="sticky top-0 p-6 border-b border-olimpics-green-secondary bg-olimpics-green-primary">
              <h2 className="text-xl font-bold text-center">Menu</h2>
              <SidebarTrigger className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden text-white hover:text-olimpics-green-secondary">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
            </SidebarHeader>
            <SidebarContent className="flex-1 overflow-y-auto">
              <SidebarGroup>
                <SidebarGroupLabel className="text-center px-4 py-2 text-sm font-medium uppercase tracking-wider text-white/70">
                  Navegação
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="px-3">
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
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
                          <Link to={item.path} className="flex items-center gap-3 p-3">
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
            <SidebarFooter className="sticky bottom-0 border-t border-olimpics-green-secondary p-4 bg-olimpics-green-primary mt-auto">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleLogout}
                    className="w-full rounded-lg p-3 flex items-center gap-3 
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
          </div>
        </Sidebar>
        <main className="flex-1 ml-64 p-6 bg-olimpics-background">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}