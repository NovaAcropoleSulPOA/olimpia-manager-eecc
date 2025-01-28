-- Create the analytics view for registrations
CREATE OR REPLACE VIEW public.vw_analytics_inscricoes AS
SELECT 
    f.id as filial_id,
    f.nome as filial,
    f.cidade,
    f.estado,
    COUNT(DISTINCT ra.id) as total_inscritos,
    COUNT(ra.id) as total_inscricoes,
    COALESCE(SUM(ra.valor_total), 0) as valor_total_arrecadado,
    COUNT(DISTINCT UNNEST(ra.modalidades)) as modalidades_ativas,
    COALESCE(AVG(ra.pontuacao), 0) as media_pontuacao_atletas,
    COUNT(CASE WHEN ra.status_inscricao = 'Confirmada' THEN 1 END) as inscricoes_confirmadas,
    COUNT(CASE WHEN ra.status_inscricao = 'Pendente' THEN 1 END) as inscricoes_pendentes,
    COUNT(CASE WHEN ra.status_inscricao = 'Cancelada' THEN 1 END) as inscricoes_canceladas,
    COUNT(CASE WHEN ra.status_inscricao = 'Recusada' THEN 1 END) as inscricoes_recusadas,
    jsonb_object_agg(
        m.nome,
        COUNT(*)
    ) as modalidades_populares
FROM 
    filiais f
    LEFT JOIN registros_atletas ra ON f.id = ra.filial_id
    LEFT JOIN modalidades m ON m.id = ANY(ra.modalidades)
GROUP BY 
    f.id, f.nome, f.cidade, f.estado;

-- Grant necessary permissions
GRANT SELECT ON public.vw_analytics_inscricoes TO authenticated;
GRANT SELECT ON public.vw_analytics_inscricoes TO service_role;