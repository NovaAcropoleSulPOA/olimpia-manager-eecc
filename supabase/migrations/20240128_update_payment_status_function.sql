-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.atualizar_status_pagamento(uuid, text);

-- Create updated function
CREATE OR REPLACE FUNCTION public.atualizar_status_pagamento(
  atleta_id uuid,
  novo_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate status
  IF novo_status NOT IN ('pendente', 'confirmado', 'cancelado') THEN
    RAISE EXCEPTION 'Status inválido. Use: pendente, confirmado ou cancelado';
  END IF;

  -- Begin transaction
  BEGIN
    -- Update payment status for all registrations of the athlete
    UPDATE inscricoes_modalidades
    SET 
      status_pagamento = novo_status,
      updated_at = NOW()
    WHERE atleta_id = $1;

    -- Check if any rows were updated
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Nenhuma inscrição encontrada para o atleta';
    END IF;

    -- If we get here, commit the transaction
    COMMIT;
  EXCEPTION
    WHEN OTHERS THEN
      -- If any error occurs, rollback the transaction
      ROLLBACK;
      RAISE;
  END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.atualizar_status_pagamento(uuid, text) TO authenticated;