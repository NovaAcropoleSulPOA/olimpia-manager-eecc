import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userEmail, userName, branch, roles, modalities, attachment } = await req.json()

    console.log('Received request with data:', {
      userEmail,
      userName,
      branch,
      roles,
      modalities,
    })

    // Construct email content
    const emailContent = `
      Novo cadastro realizado:
      
      Nome: ${userName}
      Email: ${userEmail}
      Filial: ${branch}
      Perfis: ${roles}
      ${modalities ? `Modalidades: ${modalities}` : ''}
      
      O comprovante de pagamento está anexado a este email.
    `

    // Send email using Supabase's SMTP configuration
    const emailResponse = await fetch('https://api.supabase.com/v1/send-email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'admin@olimpiadas.com.br', // Replace with actual admin email
        subject: 'Novo Comprovante de Pagamento - Olimpíadas RS 2025',
        text: emailContent,
        attachments: [
          {
            content: attachment.content,
            filename: attachment.filename,
            type: attachment.type,
          }
        ],
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Email sending failed:', errorData)
      throw new Error(`Failed to send email: ${errorData}`)
    }

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})