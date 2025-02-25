
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  dependentId: string;
  eventId: string;
  birthDate: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const requestBody: RequestBody = await req.json();
    const { dependentId, eventId, birthDate } = requestBody;

    // Initialize Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Starting dependent registration process for:', { dependentId, eventId, birthDate });

    // Calculate age to determine correct profile type
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    
    // Determine age range for profile lookup
    let ageBasedProfileName = '';
    if (age <= 6) {
      ageBasedProfileName = 'Criança 0 a 6 anos';
    } else if (age <= 12) {
      ageBasedProfileName = 'Criança 7 a 12 anos';
    } else {
      throw new Error('Age exceeds dependent registration limit (12 years)');
    }

    console.log('Looking for age-based profile:', ageBasedProfileName);

    // Directly get the age-based profile ID from perfis table
    const { data: ageBasedProfile, error: profileError } = await supabaseAdmin
      .from('perfis')
      .select('id')
      .eq('evento_id', eventId)
      .eq('nome', ageBasedProfileName)
      .single();

    if (profileError || !ageBasedProfile) {
      console.error('Error getting age-based profile:', profileError);
      throw new Error(`Age-based profile not found: ${ageBasedProfileName}`);
    }

    console.log('Found age-based profile:', ageBasedProfile);

    // Get the dependent profile type ID
    const { data: dependentProfileType } = await supabaseAdmin
      .from('perfis_tipo')
      .select('id')
      .eq('codigo', 'DEP')
      .single();

    if (!dependentProfileType) {
      throw new Error('Dependent profile type not found');
    }

    // Get the dependent profile for this event
    const { data: dependentProfile } = await supabaseAdmin
      .from('perfis')
      .select('id')
      .eq('evento_id', eventId)
      .eq('perfil_tipo_id', dependentProfileType.id)
      .single();

    if (!dependentProfile) {
      throw new Error('Dependent profile not found for event');
    }

    // Call the database function with the correct age-based profile ID
    const { error: registrationError } = await supabaseAdmin.rpc(
      'process_dependent_registration',
      {
        p_dependent_id: dependentId,
        p_event_id: eventId,
        p_birth_date: birthDate,
        p_profile_id: ageBasedProfile.id // Pass the age-based profile ID
      }
    );

    if (registrationError) {
      console.error('Error in process_dependent_registration:', registrationError);
      return new Response(
        JSON.stringify({ error: registrationError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify that the registration was successful
    const { data: registration, error: verificationError } = await supabaseAdmin
      .from('inscricoes_eventos')
      .select('selected_role')
      .eq('usuario_id', dependentId)
      .eq('evento_id', eventId)
      .single();

    if (verificationError || !registration) {
      throw new Error('Failed to verify registration');
    }

    if (registration.selected_role !== ageBasedProfile.id) {
      throw new Error('Failed to set correct selected_role for dependent');
    }

    console.log('Successfully processed dependent registration with age-based profile');

    return new Response(
      JSON.stringify({ success: true, profileId: ageBasedProfile.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
