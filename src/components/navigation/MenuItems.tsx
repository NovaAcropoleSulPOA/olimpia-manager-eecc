
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
    <div className="flex gap-1 md:gap-2 items-center">
      {user && (
        <>
          {roles.isAthlete && (
            <Link to="/athlete-profile">
              <Button
                variant={location.pathname === '/athlete-profile' ? 'default' : 'ghost'}
                className="flex gap-1 items-center"
              >
                <User className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Perfil</span>
              </Button>
            </Link>
          )}

          {roles.isOrganizer && (
            <Link to="/organizer-dashboard">
              <Button
                variant={location.pathname === '/organizer-dashboard' ? 'default' : 'ghost'}
                className="flex gap-1 items-center"
              >
                <Users className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Organizador</span>
              </Button>
            </Link>
          )}

          {roles.isDelegationRep && (
            <Link to="/delegation-dashboard">
              <Button
                variant={location.pathname === '/delegation-dashboard' ? 'default' : 'ghost'}
                className="flex gap-1 items-center"
              >
                <Users className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Delegação</span>
              </Button>
            </Link>
          )}

          {isJudge && (
            <Link to="/judge-dashboard">
              <Button
                variant={location.pathname === '/judge-dashboard' ? 'default' : 'ghost'}
                className="flex gap-1 items-center"
              >
                <Gavel className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Juiz</span>
              </Button>
            </Link>
          )}

          <Link to="/cronograma">
            <Button
              variant={location.pathname === '/cronograma' ? 'default' : 'ghost'}
              className="flex gap-1 items-center"
            >
              <Calendar className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Cronograma</span>
            </Button>
          </Link>

          <Link to="/scores">
            <Button
              variant={location.pathname === '/scores' ? 'default' : 'ghost'}
              className="flex gap-1 items-center"
            >
              <Medal className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Pontuações</span>
            </Button>
          </Link>

          <Button variant="ghost" onClick={handleSignOut} className="flex items-center gap-1">
            <LogOut className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">Sair</span>
          </Button>
        </>
      )}

      {!user && (
        <Link to="/login">
          <Button variant="default" className="flex items-center gap-1">
            <User className="h-4 w-4 mr-1" />
            <span>Entrar</span>
          </Button>
        </Link>
      )}
    </div>
  );
};
