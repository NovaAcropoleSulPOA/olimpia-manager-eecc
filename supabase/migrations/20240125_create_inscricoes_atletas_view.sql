CREATE OR REPLACE VIEW public.vw_inscricoes_atletas AS
SELECT 
    ra.id,
    ra.nome_atleta,
    ra.email,
    ra.telefone,
    ra.filial,
    ra.status_inscricao,
    ra.status_pagamento,
    COALESCE(
        json_agg(
            json_build_object(
                'id', im.id,
                'modalidade', m.nome,
                'status', im.status,
                'justificativa_status', im.justificativa_status
            )
        ) FILTER (WHERE im.id IS NOT NULL),
        '[]'::json
    ) as modalidades
FROM 
    registros_atletas ra
    LEFT JOIN inscricoes_modalidades im ON ra.id = im.atleta_id
    LEFT JOIN modalidades m ON im.modalidade_id = m.id
GROUP BY 
    ra.id, 
    ra.nome_atleta, 
    ra.email, 
    ra.telefone, 
    ra.filial,
    ra.status_inscricao,
    ra.status_pagamento;

-- Grant necessary permissions
GRANT SELECT ON public.vw_inscricoes_atletas TO authenticated;
GRANT SELECT ON public.vw_inscricoes_atletas TO service_role;