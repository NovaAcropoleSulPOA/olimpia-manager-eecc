
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { differenceInYears } from "date-fns";

interface EventRegistrationParams {
  eventId: string;
  selectedRole: 'ATL' | 'PGR';
}

export const useEventRegistration = (userId: string | undefined) => {
  return useMutation({
    mutationFn: async ({ eventId, selectedRole }: EventRegistrationParams) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        // Get user's age
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('data_nascimento')
          .eq('id', userId)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          throw new Error('Error fetching user data');
        }

        const age = userData.data_nascimento 
          ? differenceInYears(new Date(), new Date(userData.data_nascimento))
          : null;

        const isMinor = age !== null && age < 13;
        const childProfileCode = age !== null && age <= 6 ? 'C-6' : 'C+7';

        // Get profile types
        const { data: profileTypes, error: profileTypesError } = await supabase
          .from('perfis_tipo')
          .select('id, codigo')
          .in('codigo', isMinor ? [selectedRole, childProfileCode] : [selectedRole]);

        if (profileTypesError) {
          console.error('Error fetching profile types:', profileTypesError);
          throw new Error('Error fetching profile types');
        }

        // Get profiles for each profile type
        const { data: profiles, error: profilesError } = await supabase
          .from('perfis')
          .select('id, perfil_tipo_id')
          .eq('evento_id', eventId)
          .in('perfil_tipo_id', profileTypes.map(pt => pt.id));

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw new Error('Error fetching profiles');
        }

        // Get registration fees for each profile
        const { data: fees, error: feesError } = await supabase
          .from('taxas_inscricao')
          .select('id, perfil_id')
          .eq('evento_id', eventId)
          .in('perfil_id', profiles.map(p => p.id));

        if (feesError) {
          console.error('Error fetching registration fees:', feesError);
          throw new Error('Error fetching registration fees');
        }

        // Create single event registration with the main role (ATL/PGR)
        const mainProfile = profiles.find(p => 
          profileTypes.find(pt => pt.id === p.perfil_tipo_id)?.codigo === selectedRole
        );

        if (!mainProfile) {
          throw new Error('Main profile not found');
        }

        const mainFee = fees.find(f => f.perfil_id === mainProfile.id);

        if (!mainFee) {
          throw new Error('Registration fee not found');
        }

        // Create main event registration
        const { error: registrationError } = await supabase
          .from('inscricoes_eventos')
          .upsert({
            usuario_id: userId,
            evento_id: eventId,
            taxa_inscricao_id: mainFee.id,
            selected_role: selectedRole
          }, {
            onConflict: 'usuario_id,evento_id,selected_role'
          });

        if (registrationError) {
          console.error('Error creating registration:', registrationError);
          throw new Error('Error creating registration');
        }

        // Create user roles (including child profile if applicable)
        const userRoles = profiles.map(profile => ({
          usuario_id: userId,
          perfil_id: profile.id,
          evento_id: eventId
        }));

        const { error: roleError } = await supabase
          .from('papeis_usuarios')
          .upsert(userRoles, {
            onConflict: 'usuario_id,perfil_id,evento_id'
          });

        if (roleError) {
          console.error('Error assigning roles:', roleError);
          throw new Error('Error assigning roles');
        }

        return { success: true };
      } catch (error: any) {
        console.error('Registration error:', error);
        toast.error(error.message || 'Erro ao realizar inscrição');
        throw error;
      }
    }
  });
};
