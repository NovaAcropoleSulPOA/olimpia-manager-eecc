
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useAthleteProfile = (userId: string | undefined, eventId: string | null) => {
  return useQuery({
    queryKey: ['athlete-profile', userId, eventId],
    queryFn: async () => {
      if (!userId || !eventId) return null;
      console.log('Fetching athlete profile for user:', userId, 'event:', eventId);
      
      const { data, error } = await supabase
        .from('view_perfil_atleta')
        .select('*')
        .eq('atleta_id', userId)
        .eq('evento_id', eventId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching athlete profile:', error);
        throw error;
      }
      return data;
    },
    enabled: !!userId && !!eventId,
  });
};
