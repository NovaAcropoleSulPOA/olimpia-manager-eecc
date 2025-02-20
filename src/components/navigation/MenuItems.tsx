
import { User, BarChart3, ClipboardList, Users, Calendar, Settings2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '../ui/sidebar';

interface MenuItemsProps {
  isOrganizer: boolean;
  isAthlete: boolean;
  isDelegationRep: boolean;
  isAdmin: boolean;
}

export function MenuItems({ isOrganizer, isAthlete, isDelegationRep, isAdmin }: MenuItemsProps) {
  const location = useLocation();

  // Build menu items based on user roles
  const menuItems = [
    // Profile and Schedule are available for all authenticated users
    {
      title: "Perfil",
      icon: User,
      path: "/athlete-profile"
    },
    {
      title: "Cronograma",
      icon: Calendar,
      path: "/cronograma"
    }
  ];

  // Add role-specific menu items
  if (isAthlete) {
    menuItems.push({
      title: "Minhas Inscrições",
      icon: ClipboardList,
      path: "/athlete-registrations"
    });
  }

  if (isOrganizer) {
    menuItems.push({
      title: "Organizador(a)",
      icon: BarChart3,
      path: "/organizer-dashboard"
    });
  }

  if (isDelegationRep) {
    menuItems.push({
      title: "Delegação",
      icon: Users,
      path: "/delegation-dashboard"
    });
  }

  if (isAdmin) {
    menuItems.push({
      title: "Administração",
      icon: Settings2,
      path: "/administration"
    });
  }

  return (
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
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium whitespace-nowrap">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
