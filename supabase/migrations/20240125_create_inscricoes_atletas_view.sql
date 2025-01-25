CREATE OR REPLACE VIEW public.vw_inscricoes_atletas AS
SELECT 
    u.id,
    u.nome_completo as nome_atleta,
    u.email,
    u.telefone,
    f.nome as filial,
    ARRAY_AGG(DISTINCT m.nome) as modalidades,
    im.status as status_inscricao,
    p.status as status_pagamento,
    COALESCE(SUM(p2.pontos), 0) as pontos_totais
FROM 
    usuarios u
    LEFT JOIN filiais f ON u.filial_id = f.id
    LEFT JOIN inscricoes_modalidades im ON u.id = im.atleta_id
    LEFT JOIN modalidades m ON im.modalidade_id = m.id
    LEFT JOIN pagamentos p ON u.id = p.atleta_id
    LEFT JOIN pontuacoes p2 ON u.id = p2.atleta_id
WHERE 
    EXISTS (
        SELECT 1 
        FROM papeis_usuarios pu 
        JOIN perfis pe ON pu.perfil_id = pe.id 
        WHERE pu.usuario_id = u.id 
        AND pe.nome = 'Atleta'
    )
GROUP BY 
    u.id, 
    u.nome_completo, 
    u.email, 
    u.telefone, 
    f.nome,
    im.status,
    p.status;

-- Grant necessary permissions
GRANT SELECT ON public.vw_inscricoes_atletas TO authenticated;
GRANT SELECT ON public.vw_inscricoes_atletas TO service_role;