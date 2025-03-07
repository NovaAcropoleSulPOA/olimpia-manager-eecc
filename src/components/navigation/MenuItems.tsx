
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/hooks/useNavigation';
import { Button } from '@/components/ui/button';
import { LogOut, User, Users, Calendar, Medal, Gavel } from 'lucide-react';

export const MenuItems = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const { roles, user } = useNavigation();

  // Check if the user has the 'JUZ' (Judge) role
  const isJudge = user?.papeis?.some(role => role.codigo === 'JUZ') || false;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex flex-col gap-1 md:gap-2 items-start w-full">
      {user && (
        <>
          {roles.isAthlete && (
            <Link to="/athlete-profile" className="w-full">
              <Button
                variant={location.pathname === '/athlete-profile' ? 'default' : 'ghost'}
                className="flex gap-1 items-center w-full justify-start"
              >
                <User className="h-4 w-4 mr-1" />
                <span>Perfil</span>
              </Button>
            </Link>
          )}

          {roles.isOrganizer && (
            <Link to="/organizer-dashboard" className="w-full">
              <Button
                variant={location.pathname === '/organizer-dashboard' ? 'default' : 'ghost'}
                className="flex gap-1 items-center w-full justify-start"
              >
                <Users className="h-4 w-4 mr-1" />
                <span>Organizador</span>
              </Button>
            </Link>
          )}

          {roles.isDelegationRep && (
            <Link to="/delegation-dashboard" className="w-full">
              <Button
                variant={location.pathname === '/delegation-dashboard' ? 'default' : 'ghost'}
                className="flex gap-1 items-center w-full justify-start"
              >
                <Users className="h-4 w-4 mr-1" />
                <span>Delegação</span>
              </Button>
            </Link>
          )}

          {isJudge && (
            <Link to="/judge-dashboard" className="w-full">
              <Button
                variant={location.pathname === '/judge-dashboard' ? 'default' : 'ghost'}
                className="flex gap-1 items-center w-full justify-start"
              >
                <Gavel className="h-4 w-4 mr-1" />
                <span>Juiz</span>
              </Button>
            </Link>
          )}

          <Link to="/cronograma" className="w-full">
            <Button
              variant={location.pathname === '/cronograma' ? 'default' : 'ghost'}
              className="flex gap-1 items-center w-full justify-start"
            >
              <Calendar className="h-4 w-4 mr-1" />
              <span>Cronograma</span>
            </Button>
          </Link>

          <Link to="/scores" className="w-full">
            <Button
              variant={location.pathname === '/scores' ? 'default' : 'ghost'}
              className="flex gap-1 items-center w-full justify-start"
            >
              <Medal className="h-4 w-4 mr-1" />
              <span>Pontuações</span>
            </Button>
          </Link>

          <Button variant="ghost" onClick={handleSignOut} className="flex items-center gap-1 w-full justify-start">
            <LogOut className="h-4 w-4 mr-1" />
            <span>Sair</span>
          </Button>
        </>
      )}

      {/* Removed the login button that was here */}
    </div>
  );
};
