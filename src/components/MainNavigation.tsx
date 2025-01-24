import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarFooter
} from './ui/sidebar';
import { User, Medal, Users, Award, BarChart3, LogOut } from 'lucide-react';
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
      navigate('/'); // Redirect to landing page instead of login
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  // Always show AthleteProfile first
  const menuItems = [
    {
      title: "Perfil do Atleta",
      icon: User,
      path: "/athlete-profile",
      roles: ["Atleta", "Juiz", "Organizador", "Rep. de Delegação"]
    }
  ];

  // Add role-specific pages
  if (user?.papeis?.includes("Organizador")) {
    menuItems.push({
      title: "Área do Organizador",
      icon: BarChart3,
      path: "/organizer-dashboard",
      roles: ["Organizador"]
    });
  }

  if (user?.papeis?.includes("Juiz")) {
    menuItems.push({
      title: "Área do Juiz",
      icon: Medal,
      path: "/judge-dashboard",
      roles: ["Juiz"]
    });
  }

  if (user?.papeis?.includes("Rep. de Delegação")) {
    menuItems.push({
      title: "Área da Delegação",
      icon: Users,
      path: "/delegation-dashboard",
      roles: ["Rep. de Delegação"]
    });
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="bg-olimpics-green-primary text-white">
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
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
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="text-red-300 hover:text-red-100"
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