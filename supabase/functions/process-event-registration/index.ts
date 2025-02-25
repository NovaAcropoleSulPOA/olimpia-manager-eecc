
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
    
    // Get the correct profile type code based on age
    const profileTypeCode = age <= 6 ? 'C-6' : 'C+7';
    console.log('Determined profile type code:', profileTypeCode);

    // First, get the perfil_tipo_id for the age-based profile
    const { data: profileTypeData, error: profileTypeError } = await supabaseAdmin
      .from('perfis_tipo')
      .select('id')
      .eq('codigo', profileTypeCode)
      .single();

    if (profileTypeError || !profileTypeData) {
      console.error('Error getting profile type:', profileTypeError);
      throw new Error(`Profile type not found for code: ${profileTypeCode}`);
    }

    // Then, get the actual perfis.id that we'll use for selected_role
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('perfis')
      .select('id')
      .eq('evento_id', eventId)
      .eq('perfil_tipo_id', profileTypeData.id)
      .single();

    if (profileError || !profileData) {
      console.error('Error getting profile:', profileError);
      throw new Error(`Profile not found for event and profile type`);
    }

    console.log('Found profile ID for registration:', profileData.id);

    // Call the database function with the correct profile ID
    const { data, error } = await supabaseAdmin.rpc(
      'process_dependent_registration',
      {
        p_dependent_id: dependentId,
        p_event_id: eventId,
        p_birth_date: birthDate,
        p_profile_id: profileData.id // Pass the actual perfis.id
      }
    );

    if (error) {
      console.error('Error in process_dependent_registration:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Successfully processed dependent registration');

    return new Response(
      JSON.stringify({ success: true, data }),
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
