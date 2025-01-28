-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.atualizar_status_pagamento(uuid, text);

-- Create updated function
CREATE OR REPLACE FUNCTION public.atualizar_status_pagamento(
    novo_status text,
    p_atleta_id uuid
)
RETURNS SETOF public.inscricoes_modalidades
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count integer;
BEGIN
    -- Validate status
    IF novo_status NOT IN ('pendente', 'confirmado', 'cancelado') THEN
        RAISE EXCEPTION 'Status inválido. Use: pendente, confirmado ou cancelado';
    END IF;

    -- Count existing registrations
    SELECT COUNT(*)
    INTO v_count
    FROM inscricoes_modalidades
    WHERE atleta_id = p_atleta_id;

    IF v_count = 0 THEN
        RAISE EXCEPTION 'Nenhuma inscrição encontrada para o atleta: %', p_atleta_id;
    END IF;

    -- Update payment status for all registrations of the athlete
    RETURN QUERY
    UPDATE inscricoes_modalidades
    SET 
        status_pagamento = novo_status,
        updated_at = NOW()
    WHERE atleta_id = p_atleta_id
    RETURNING *;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.atualizar_status_pagamento(text, uuid) TO authenticated;