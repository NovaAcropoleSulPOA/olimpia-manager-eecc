
import { supabase } from '../supabase';

export const fetchUserProfiles = async (eventId: string | null) => {
  console.log('Fetching user profiles for event:', eventId);
  
  if (!eventId) {
    console.warn('No event ID provided for fetching user profiles');
    return [];
  }

  const { data: users, error: usersError } = await supabase
    .from('usuarios')
    .select(`
      id,
      nome_completo,
      email,
      filial_id,
      filiais:filial_id (
        nome
      ),
      papeis_usuarios!inner (
        perfil_id,
        evento_id,
        perfis:perfil_id (
          nome
        )
      )
    `)
    .eq('papeis_usuarios.evento_id', eventId)
    .order('nome_completo');

  if (usersError) {
    console.error('Error fetching users:', usersError);
    throw usersError;
  }

  console.log('Raw users data:', users);

  if (!users) return [];

  const formattedUsers = users.map((user: any) => ({
    id: user.id,
    nome_completo: user.nome_completo,
    email: user.email,
    filial_id: user.filial_id,
    filial_nome: user.filiais?.nome || 'Sem filial',
    profiles: (user.papeis_usuarios || []).map((papel: any) => ({
      perfil_id: papel.perfil_id,
      perfil_nome: papel.perfis?.nome || ''
    }))
  }));

  console.log('Formatted users:', formattedUsers);
  return formattedUsers;
};

export const updateUserProfiles = async (userId: string, profileIds: number[]): Promise<void> => {
  const currentEventId = localStorage.getItem('currentEventId');
  
  if (!currentEventId) {
    throw new Error('No event selected');
  }

  const { error } = await supabase
    .rpc('assign_user_profiles', {
      p_user_id: userId,
      p_profile_ids: profileIds,
      p_event_id: currentEventId
    });

  if (error) throw error;
};

export const swapUserProfile = async (
  userId: string,
  eventId: string,
  newProfileId: number,
  oldProfileId: number
): Promise<void> => {
  console.log('Starting swapUserProfile function...', {
    userId,
    eventId,
    newProfileId,
    oldProfileId
  });

  try {
    const { error } = await supabase
      .rpc('swap_user_profile', {
        p_user_id: userId,
        p_event_id: eventId,
        p_new_profile_id: newProfileId,
        p_old_profile_id: oldProfileId
      });

    if (error) {
      console.error('Error in swapUserProfile RPC call:', error);
      throw error;
    }

    const { data: updatedProfiles, error: checkError } = await supabase
      .from('papeis_usuarios')
      .select('perfil_id, perfis:perfil_id(nome)')
      .eq('usuario_id', userId)
      .eq('evento_id', eventId);

    if (checkError) {
      console.error('Error verifying profile swap:', checkError);
      throw checkError;
    }

    console.log('Profile swap verification - Current profiles:', updatedProfiles);

  } catch (error) {
    console.error('Error in swapUserProfile:', error);
    throw error;
  }
};
