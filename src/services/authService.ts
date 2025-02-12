
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { AuthUser } from '@/types/auth';
import { toast } from 'sonner';

export const fetchUserProfile = async (userId: string) => {
  try {
    console.log('Fetching user profile for ID:', userId);
    
    // Get current event ID from localStorage since roles are now event-specific
    const currentEventId = localStorage.getItem('currentEventId');
    
    const { data: userRoles, error: rolesError } = await supabase
      .from('papeis_usuarios')
      .select('perfis (id, nome)')
      .eq('usuario_id', userId)
      .eq('evento_id', currentEventId);

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
  
  // If user is on a public route, redirect to event selection
  if (['/login', '/', '/forgot-password'].includes(pathname)) {
    console.log('AuthContext - Redirecting to event selection');
    navigate('/event-selection');
  }
};

