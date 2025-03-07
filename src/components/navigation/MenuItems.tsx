
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigation } from '@/hooks/useNavigation';
import { User, Users, Calendar, Medal, Gavel, Settings2 } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

export const MenuItems = ({ collapsed = false }) => {
  const location = useLocation();
  const { roles, user } = useNavigation();

  // Check if the user has the 'JUZ' (Judge) role
  const isJudge = user?.papeis?.some(role => role.codigo === 'JUZ') || false;
  const isAdmin = roles.isAdmin;
  const isOrganizer = roles.isOrganizer;
  const isDelegationRep = roles.isDelegationRep;
  const isAthlete = roles.isAthlete;

  const menuItems = [];
  
  // Add items in the specified order
  
  // 1. Perfil (Athlete Profile)
  if (isAthlete) {
    menuItems.push({
      path: "/athlete-profile",
      label: "Perfil",
      icon: <User className="h-5 w-5 mr-2" />,
      tooltip: "Perfil do Atleta"
    });
  }
  
  // 2. Cronograma (Schedule)
  menuItems.push({
    path: "/cronograma",
    label: "Cronograma",
    icon: <Calendar className="h-5 w-5 mr-2" />,
    tooltip: "Cronograma"
  });
  
  // 3. Pontuações (Scores)
  menuItems.push({
    path: "/scores",
    label: "Pontuações",
    icon: <Medal className="h-5 w-5 mr-2" />,
    tooltip: "Pontuações"
  });
  
  // 4. Organizador (Organizer)
  if (isOrganizer) {
    menuItems.push({
      path: "/organizer-dashboard",
      label: "Organizador",
      icon: <Users className="h-5 w-5 mr-2" />,
      tooltip: "Organizador"
    });
  }
  
  // 5. Delegação (Delegation)
  if (isDelegationRep) {
    menuItems.push({
      path: "/delegation-dashboard",
      label: "Delegação",
      icon: <Users className="h-5 w-5 mr-2" />,
      tooltip: "Delegação"
    });
  }
  
  // 6. Juiz (Judge)
  if (isJudge) {
    menuItems.push({
      path: "/judge-dashboard",
      label: "Juiz",
      icon: <Gavel className="h-5 w-5 mr-2" />,
      tooltip: "Juiz"
    });
  }
  
  // 7. Administração (Administration)
  if (isAdmin) {
    menuItems.push({
      path: "/administration",
      label: "Administração",
      icon: <Settings2 className="h-5 w-5 mr-2" />,
      tooltip: "Administração"
    });
  }

  return (
    <SidebarMenu className="flex flex-col gap-1 md:gap-2 items-start w-full px-2 py-2">
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.path}>
          <SidebarMenuButton 
            asChild 
            isActive={location.pathname === item.path}
            tooltip={item.tooltip}
          >
            <Link to={item.path} className="w-full flex items-center text-base">
              {item.icon}
              <span className={collapsed ? 'hidden' : 'block'}>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};
