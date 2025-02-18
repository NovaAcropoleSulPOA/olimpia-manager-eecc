
import { Outlet } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarContent, 
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from './ui/sidebar';
import { LogOut, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { MenuItems } from './navigation/MenuItems';
import { EventSwitcher } from './navigation/EventSwitcher';
import { useNavigation } from '@/hooks/useNavigation';

export function MainNavigation() {
  const navigate = useNavigate();
  const { user, roles, signOut } = useNavigation();

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

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-1 w-full">
        <Sidebar className="bg-olimpics-green-primary text-white fixed md:sticky top-16 h-[calc(100vh-4rem)] z-50">
          <SidebarHeader className="relative p-6 border-b border-olimpics-green-secondary">
            <h2 className="text-xl font-bold text-center">Menu</h2>
            <SidebarTrigger className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden text-white hover:text-olimpics-green-secondary">
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
          </SidebarHeader>
          <SidebarContent>
            <MenuItems {...roles} />
          </SidebarContent>
          <SidebarFooter className="mt-auto border-t border-olimpics-green-secondary p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <EventSwitcher userId={user.id} />
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="w-full rounded-lg p-4 flex items-center gap-3 
                    text-red-300 hover:text-red-100 hover:bg-red-500/20 
                    transition-all duration-200 text-lg font-medium"
                  tooltip="Sair"
                >
                  <LogOut className="h-6 w-6 flex-shrink-0" />
                  <span className="whitespace-nowrap">Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 p-6 bg-olimpics-background min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
