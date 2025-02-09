
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { AuthUser } from '@/types/auth';
import { toast } from 'sonner';

export const fetchUserProfile = async (userId: string) => {
  try {
    console.log('Fetching user profile for ID:', userId);
    
    const { data: userRoles, error: rolesError } = await supabase
      .from('papeis_usuarios')
      .select('perfis (id, nome)')
      .eq('usuario_id', userId);

    if (rolesError) throw rolesError;

    const { data: userProfile, error: profileError } = await supabase
      .from('usuarios')
      .select('nome_completo, telefone, filial_id, confirmado')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!userProfile) {
      console.log('No user profile found, returning minimal profile');
      return {
        confirmado: false,
        papeis: [],
      };
    }

    const papeis = userRoles?.map((ur: any) => ur.perfis.nome) || [];
    console.log('User roles fetched:', papeis);
    
    return {
      ...userProfile,
      papeis,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const handleAuthRedirect = (userProfile: any, pathname: string, navigate: Function) => {
  console.log('AuthContext - Handling auth redirect');
  console.log('AuthContext - Current location:', pathname);
  console.log('AuthContext - User profile for redirect:', userProfile);
  
  // Don't redirect if we're on the reset-password page and came from profile
  if (pathname === '/reset-password') {
    console.log('AuthContext - Skipping redirect for password reset');
    return;
  }
  
  // Only redirect if on a public route
  if (['/login', '/', '/forgot-password'].includes(pathname)) {
    const roles = userProfile.papeis || [];
    console.log('AuthContext - User roles for redirect:', roles);

    if (roles.includes('Atleta')) {
      console.log('AuthContext - Redirecting to athlete profile');
      navigate('/athlete-profile');
    } else if (roles.includes('Organizador')) {
      console.log('AuthContext - Redirecting to organizer dashboard');
      navigate('/organizer-dashboard');
    } else if (roles.includes('Representante de Delegação')) {
      console.log('AuthContext - Redirecting to delegation dashboard');
      navigate('/delegation-dashboard');
    } else if (roles.includes('Público Geral') || roles.length === 0) {
      // Default redirection for Público Geral or users with no specific roles
      console.log('AuthContext - Redirecting public user to profile');
      navigate('/athlete-profile');
    }
  }
};

