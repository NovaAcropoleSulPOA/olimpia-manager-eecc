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
  const isPublicGeral = userRoles.includes('Público Geral');

  useEffect(() => {
    if (location.pathname === '/') {
      console.log('MainNavigation - Initial navigation based on roles');
      if (isAthlete || isPublicGeral) {
        navigate('/athlete-profile');
      } else if (isOrganizer) {
        navigate('/organizer-dashboard');
      } else if (isDelegationRep) {
        navigate('/delegation-dashboard');
      }
    }
  }, [isAthlete, isOrganizer, isDelegationRep, isPublicGeral, location.pathname, navigate]);

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
    ...(isAthlete || userRoles.includes('Público Geral') ? [
      {
        title: "Perfil",
        icon: User,
        path: "/athlete-profile"
      }
    ] : []),
    ...(isAthlete ? [
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
        title: "Delegação",
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
      <div className="flex flex-1 w-full"> {/* Removed fixed height calculation */}
        <Sidebar className="bg-olimpics-green-primary text-white sticky top-16 h-[calc(100vh-4rem)]"> {/* Added sticky positioning */}
          <SidebarHeader className="relative p-6 border-b border-olimpics-green-secondary">
            <h2 className="text-xl font-bold text-center">Menu</h2>
            <SidebarTrigger className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden text-white hover:text-olimpics-green-secondary">
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
          </SidebarHeader>
          <SidebarContent>
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
          <SidebarFooter className="mt-auto border-t border-olimpics-green-secondary p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="w-full rounded-lg p-4 flex items-center gap-3 
                    text-red-300 hover:text-red-100 hover:bg-red-500/20 
                    transition-all duration-200 text-lg font-medium"
                  tooltip="Sair"
                >
                  <LogOut className="h-6 w-6" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 p-6 bg-olimpics-background min-h-[calc(100vh-4rem-4rem)]"> {/* Adjusted min-height */}
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
