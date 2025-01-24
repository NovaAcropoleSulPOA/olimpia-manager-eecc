import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sidebar, SidebarProvider, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import { User, Medal, Users, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function MainNavigation() {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      title: "Perfil Olímpico",
      icon: User,
      path: "/dashboard",
      roles: ["Atleta"]
    },
    {
      title: "Área do Juiz",
      icon: Medal,
      path: "/judge",
      roles: ["Juiz"]
    },
    {
      title: "Área do Organizador",
      icon: Award,
      path: "/organizer",
      roles: ["Organizador"]
    },
    {
      title: "Área da Delegação",
      icon: Users,
      path: "/delegation",
      roles: ["Rep. de Delegação"]
    }
  ];

  const userRoles = user?.papeis || [];
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.some(role => userRoles.includes(role))
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="bg-olimpics-green-primary text-white">
          <SidebarContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
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
        </Sidebar>
        <main className="flex-1 p-6 bg-olimpics-background">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}