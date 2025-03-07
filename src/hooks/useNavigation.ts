
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { UserRole } from '@/types/auth';

interface UserRoles {
  isOrganizer: boolean;
  isAthlete: boolean;
  isDelegationRep: boolean;
  isPublicGeral: boolean;
  isAdmin: boolean;
  isJudge: boolean;
}

export const useNavigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get all roles codes from the user's roles
  const userRoleCodes = user?.papeis?.map(role => role.codigo) || [];
  console.log('User role codes:', userRoleCodes);

  // Check for each role type
  const roles: UserRoles = {
    isOrganizer: userRoleCodes.includes('ORE'),
    isAthlete: userRoleCodes.includes('ATL'),
    isDelegationRep: userRoleCodes.includes('RDD'),
    isPublicGeral: userRoleCodes.includes('PGR'),
    isAdmin: userRoleCodes.includes('ADM'),
    isJudge: userRoleCodes.includes('JUZ')
  };

  useEffect(() => {
    if (location.pathname === '/') {
      console.log('MainNavigation - Initial navigation based on roles');
      if (roles.isAthlete || roles.isPublicGeral) {
        navigate('/athlete-profile');
      } else if (roles.isOrganizer) {
        navigate('/organizer-dashboard');
      } else if (roles.isDelegationRep) {
        navigate('/delegation-dashboard');
      } else if (roles.isAdmin) {
        navigate('/administration');
      } else if (roles.isJudge) {
        navigate('/judge-dashboard');
      }
    }
  }, [roles, location.pathname, navigate]);

  return {
    user,
    roles,
    signOut
  };
};
