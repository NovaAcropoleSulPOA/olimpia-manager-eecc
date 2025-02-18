
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { AuthUser, UserRole } from '@/types/auth';
import { toast } from 'sonner';

export const fetchUserProfile = async (userId: string) => {
  try {
    console.log('Fetching user profile for ID:', userId);
    
    // Get current event ID from localStorage since roles are now event-specific
    const currentEventId = localStorage.getItem('currentEventId');
    
    if (!currentEventId) {
      console.log('No current event ID found, fetching user profile without roles');
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
          papeis: [] as UserRole[],
        };
      }

      return {
        ...userProfile,
        papeis: [] as UserRole[],
      };
    }

    // If we have an event ID, fetch roles for that event
    const { data: userRoles, error: rolesError } = await supabase
      .from('papeis_usuarios')
      .select(`
        perfis (
          nome,
          perfil_tipo_id,
          perfis_tipo (
            codigo,
            descricao
          )
        )
      `)
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
        papeis: [] as UserRole[],
      };
    }

    const papeis = userRoles?.map((ur: any) => ({
      nome: ur.perfis.nome,
      codigo: ur.perfis.perfis_tipo.codigo,
      descricao: ur.perfis.perfis_tipo.descricao
    })) as UserRole[] || [];
    
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
