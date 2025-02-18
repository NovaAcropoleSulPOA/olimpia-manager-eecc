
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('Loading event registration function...')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request body
    const { p_user_id, p_event_id, p_profile_id, p_registration_fee_id } = await req.json()

    // Validate input
    if (!p_user_id || !p_event_id || !p_profile_id || !p_registration_fee_id) {
      throw new Error('Missing required parameters')
    }

    console.log('Processing registration with params:', {
      p_user_id,
      p_event_id,
      p_profile_id,
      p_registration_fee_id
    })

    // Call the database function
    const { data, error: rpcError } = await supabaseClient.rpc('process_event_registration', {
      p_user_id,
      p_event_id,
      p_profile_id,
      p_registration_fee_id
    })

    if (rpcError) {
      throw rpcError
    }

    console.log('Registration processed successfully:', data)

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
