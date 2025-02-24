
CREATE OR REPLACE FUNCTION get_event_analytics(p_event_id uuid)
RETURNS TABLE (
  filial_id uuid,
  filial text,
  total_inscritos bigint,
  valor_total_pago numeric,
  valor_total_pendente numeric,
  modalidades_populares json,
  inscritos_por_status_pagamento json,
  inscritos_por_status json,
  ranking_filiais json,
  atletas_por_categoria json,
  media_pontuacao_por_modalidade json
)
LANGUAGE sql
SECURITY DEFINER
AS $$
WITH 
  total_atletas AS (
    SELECT
      u.filial_id,
      COUNT(DISTINCT im.atleta_id) AS quantidade
    FROM
      inscricoes_modalidades im
      JOIN usuarios u ON im.atleta_id = u.id
      JOIN modalidades m ON im.modalidade_id = m.id
    WHERE
      im.evento_id = p_event_id
    GROUP BY
      u.filial_id
  ),
  valor_total_arrecadado AS (
    SELECT
      u.filial_id,
      COALESCE(SUM(CASE WHEN p.status = 'confirmado' THEN p.valor ELSE 0 END), 0) AS total_pago,
      COALESCE(SUM(CASE WHEN p.status = 'pendente' THEN p.valor ELSE 0 END), 0) AS total_pendente
    FROM
      pagamentos p
      JOIN usuarios u ON p.atleta_id = u.id
    WHERE
      p.evento_id = p_event_id
    GROUP BY
      u.filial_id
  ),
  modalidades_mais_populares AS (
    SELECT
      u.filial_id,
      m.nome AS modalidade,
      COUNT(DISTINCT im.atleta_id) AS total_inscritos
    FROM
      inscricoes_modalidades im
      JOIN modalidades m ON im.modalidade_id = m.id
      JOIN usuarios u ON im.atleta_id = u.id
    WHERE
      im.evento_id = p_event_id
      AND im.status NOT IN ('Cancelada', 'Recusada')
    GROUP BY
      u.filial_id, m.nome
    ORDER BY
      u.filial_id, COUNT(DISTINCT im.atleta_id) DESC
  ),
  status_pagamento AS (
    SELECT
      u.filial_id,
      p.status AS status_pagamento,
      COUNT(DISTINCT p.atleta_id) AS quantidade
    FROM
      pagamentos p
      JOIN usuarios u ON p.atleta_id = u.id
    WHERE
      p.evento_id = p_event_id
    GROUP BY
      u.filial_id, p.status
  ),
  inscritos_status AS (
    SELECT
      u.filial_id,
      im.status AS status_inscricao,
      COUNT(DISTINCT im.atleta_id) AS quantidade
    FROM
      inscricoes_modalidades im
      JOIN usuarios u ON im.atleta_id = u.id
    WHERE
      im.evento_id = p_event_id
    GROUP BY
      u.filial_id, im.status
  ),
  ranking_filiais_data AS (
    SELECT
      rf.filial_id,
      COALESCE(SUM(rf.total_pontos), 0) AS total_pontos
    FROM
      ranking_filiais rf
    WHERE
      rf.evento_id = p_event_id
    GROUP BY
      rf.filial_id
  ),
  atletas_categoria AS (
    SELECT
      u.filial_id,
      m.categoria,
      COUNT(DISTINCT im.atleta_id) AS quantidade
    FROM
      inscricoes_modalidades im
      JOIN modalidades m ON im.modalidade_id = m.id
      JOIN usuarios u ON im.atleta_id = u.id
    WHERE
      im.evento_id = p_event_id
      AND im.status NOT IN ('Cancelada', 'Recusada')
    GROUP BY
      u.filial_id, m.categoria
  ),
  media_pontuacao AS (
    SELECT
      u.filial_id,
      m.nome AS modalidade,
      ROUND(AVG(p.valor_pontuacao), 2) AS media_pontuacao
    FROM
      pontuacoes p
      JOIN modalidades m ON p.modalidade_id = m.id
      JOIN usuarios u ON p.atleta_id = u.id
    WHERE
      p.evento_id = p_event_id
    GROUP BY
      u.filial_id, m.nome
  )
SELECT
  f.id AS filial_id,
  f.nome AS filial,
  COALESCE((SELECT ta.quantidade FROM total_atletas ta WHERE ta.filial_id = f.id), 0) AS total_inscritos,
  COALESCE((SELECT vta.total_pago FROM valor_total_arrecadado vta WHERE vta.filial_id = f.id), 0) AS valor_total_pago,
  COALESCE((SELECT vta.total_pendente FROM valor_total_arrecadado vta WHERE vta.filial_id = f.id), 0) AS valor_total_pendente,
  COALESCE((
    SELECT json_agg(json_build_object('modalidade', mmp.modalidade, 'total_inscritos', mmp.total_inscritos))
    FROM modalidades_mais_populares mmp WHERE mmp.filial_id = f.id
  ), '[]'::json) AS modalidades_populares,
  COALESCE((
    SELECT json_agg(json_build_object('status_pagamento', sp.status_pagamento, 'quantidade', sp.quantidade))
    FROM status_pagamento sp WHERE sp.filial_id = f.id
  ), '[]'::json) AS inscritos_por_status_pagamento,
  COALESCE((
    SELECT json_agg(json_build_object('status_inscricao', ist.status_inscricao, 'quantidade', ist.quantidade))
    FROM inscritos_status ist WHERE ist.filial_id = f.id
  ), '[]'::json) AS inscritos_por_status,
  COALESCE((
    SELECT json_agg(json_build_object('total_pontos', rfd.total_pontos))
    FROM ranking_filiais_data rfd WHERE rfd.filial_id = f.id
  ), '[]'::json) AS ranking_filiais,
  COALESCE((
    SELECT json_agg(json_build_object('categoria', ac.categoria, 'quantidade', ac.quantidade))
    FROM atletas_categoria ac WHERE ac.filial_id = f.id
  ), '[]'::json) AS atletas_por_categoria,
  COALESCE((
    SELECT json_agg(json_build_object('modalidade', mp.modalidade, 'media_pontuacao', mp.media_pontuacao))
    FROM media_pontuacao mp WHERE mp.filial_id = f.id
  ), '[]'::json) AS media_pontuacao_por_modalidade
FROM
  filiais f
  JOIN eventos_filiais ef ON f.id = ef.filial_id
WHERE
  ef.evento_id = p_event_id;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_event_analytics(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_event_analytics(uuid) TO service_role;
