
import { Settings, User, Calendar, Medal, ClipboardList, Users, Settings2 } from "lucide-react";
import { UserRole } from "@/types/auth";

export interface NavigationItem {
  icon: any;
  label: string;
  path: string;
  roles: string[];
}

export const getNavigationItems = (userRoles: UserRole[]) => {
  const navigationItems: NavigationItem[] = [
    {
      icon: User,
      label: "Perfil",
      path: "/athlete-profile",
      roles: ["ATL"],
    },
    {
      icon: Calendar,
      label: "Cronograma",
      path: "/cronograma",
      roles: ["ATL", "ORE", "RDD", "ADM"],
    }
  ];

  // Add role-specific items
  if (userRoles.some(role => role.codigo === "ATL")) {
    navigationItems.push(
      {
        icon: Medal,
        label: "Minhas Pontuações",
        path: "/scores",
        roles: ["ATL"],
      },
      {
        icon: ClipboardList,
        label: "Inscrições",
        path: "/athlete-registrations",
        roles: ["ATL"],
      }
    );
  }

  if (userRoles.some(role => role.codigo === "ORE")) {
    navigationItems.push({
      icon: Settings,
      label: "Organizador(a)",
      path: "/organizer-dashboard",
      roles: ["ORE"],
    });
  }

  if (userRoles.some(role => role.codigo === "RDD")) {
    navigationItems.push({
      icon: Users,
      label: "Delegação",
      path: "/delegation-dashboard",
      roles: ["RDD"],
    });
  }

  if (userRoles.some(role => role.codigo === "ADM")) {
    navigationItems.push({
      icon: Settings2,
      label: "Administração",
      path: "/administration",
      roles: ["ADM"],
    });
  }

  return navigationItems;
};
