
import { ArrowLeftRight, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { NavigationItem } from "./navigation-items";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

interface MobileNavigationProps {
  navigationItems: NavigationItem[];
  currentPath: string;
  userEvents: any[];
  onEventSwitch: (eventId: string) => void;
  onLogout: () => void;
}

const MobileNavigation = ({
  navigationItems,
  currentPath,
  userEvents,
  onEventSwitch,
  onLogout,
}: MobileNavigationProps) => {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
      <div className="grid grid-cols-5 gap-1 px-2 py-2">
        {navigationItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center p-2 text-xs rounded-lg transition-colors",
              currentPath === item.path
                ? "text-olimpics-green-primary bg-olimpics-green-primary/10"
                : "text-gray-500 hover:text-olimpics-green-primary hover:bg-olimpics-green-primary/5"
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span>{item.label}</span>
          </button>
        ))}
        {userEvents && userEvents.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center justify-center p-2 text-xs text-gray-500 rounded-lg hover:text-olimpics-green-primary hover:bg-olimpics-green-primary/5">
                <ArrowLeftRight className="w-5 h-5 mb-1" />
                <span>Trocar</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mb-2" sideOffset={40}>
              {userEvents.map((event: any) => (
                <DropdownMenuItem
                  key={event.id}
                  onClick={() => onEventSwitch(event.id)}
                  className="cursor-pointer"
                >
                  {event.nome}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center p-2 text-xs text-red-500 rounded-lg hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 mb-1" />
          <span>Sair</span>
        </button>
      </div>
    </nav>
  );
};

// Create a proper MobileNavigationLink component for backward compatibility
const MobileNavigationLink = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // If user is not logged in, don't render navigation
  if (!user) {
    return null;
  }
  
  // Default empty props to avoid TypeScript errors
  const defaultProps = {
    navigationItems: [],
    currentPath: location.pathname,
    userEvents: [],
    onEventSwitch: (eventId: string) => {
      localStorage.setItem('currentEventId', eventId);
      window.location.reload();
    },
    onLogout: async () => {
      try {
        await signOut();
        navigate('/');
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
  };
  
  return <MobileNavigation {...defaultProps} />;
};

export default MobileNavigation;
export { MobileNavigationLink };
