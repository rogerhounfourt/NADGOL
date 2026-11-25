-- 0005_status_atleta_expandido.sql
-- Expande o status do atleta: ativo, inativo, trancado, em_clube
-- "em_clube" = atleta cedido a outro clube (passagem em andamento na Jornada)
-- "trancado" = matrícula suspensa temporariamente
-- Atletas em_clube ou trancados saem do relatório de cobrança.

-- 1) Trocar a constraint de status
alter table public.nadgol_atletas
  drop constraint if exists nadgol_atletas_status_check;

alter table public.nadgol_atletas
  add constraint nadgol_atletas_status_check
  check (status in ('ativo','inativo','trancado','em_clube'));

-- 2) Campos auxiliares para "em_clube": nome e escudo
alter table public.nadgol_atletas
  add column if not exists clube_atual_nome text,
  add column if not exists clube_atual_escudo text;

-- 3) Atualizar a view resumo para expor os novos campos
create or replace view public.nadgol_atletas_resumo as
select
  a.id, a.escola_id, a.nome, a.foto_url,
  a.data_nascimento, a.posicao, a.pe_dominante,
  a.altura_cm, a.peso_kg, a.telefone,
  a.observacoes, a.objetivo, a.sonho, a.clube_favorito,
  a.status,
  a.clube_atual_nome,
  a.clube_atual_escudo,
  a.valor_mensalidade, a.dia_vencimento,
  a.criado_em,
  u.id   as unidade_id,
  u.nome as unidade_nome,
  t.id   as turma_id,
  coalesce(est.gols, 0)         as gols,
  coalesce(est.assistencias, 0) as assistencias,
  coalesce(est.presenca_pct, 0) as presenca_pct
from public.nadgol_atletas a
left join public.nadgol_turmas_atletas ta on ta.atleta_id = a.id
left join public.nadgol_turmas          t on t.id = ta.turma_id
left join public.nadgol_unidades        u on u.id = a.unidade_id
left join public.nadgol_estatisticas    est on est.atleta_id = a.id;

-- 4) Mensalidades: excluir trancados e em_clube da geração
-- (a geração já filtra por status = 'ativo'; basta manter esse filtro.)
-- Nenhuma mudança extra necessária na tabela de mensalidades.

-- Pronto.
