-- 0006_fix_view_resumo.sql
-- Recria a view nadgol_atletas_resumo após alteração de colunas em 0005

drop view if exists public.nadgol_atletas_resumo;

create view public.nadgol_atletas_resumo
  with (security_invoker = true) as
select a.*,
  u.nome as unidade_nome,
  (select ta.turma_id
     from public.nadgol_turmas_atletas ta
    where ta.atleta_id = a.id
    order by ta.criado_em limit 1) as turma_id,
  coalesce((select sum(pa.gols)
              from public.nadgol_partidas_atletas pa
             where pa.atleta_id = a.id), 0)::int as gols,
  coalesce((select sum(pa.assistencias)
              from public.nadgol_partidas_atletas pa
             where pa.atleta_id = a.id), 0)::int as assistencias,
  (select round(100.0 * count(*) filter (where p.status <> 'ausente')
                / nullif(count(*), 0), 0)
     from public.nadgol_presencas p
    where p.atleta_id = a.id)::int as presenca_pct,
  coalesce((select sum(x.xp)
              from public.nadgol_xp_eventos x
             where x.atleta_id = a.id), 0)::int as xp
from public.nadgol_atletas a
left join public.nadgol_unidades u on u.id = a.unidade_id;
