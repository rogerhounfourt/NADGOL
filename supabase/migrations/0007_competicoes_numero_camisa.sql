-- 0007_competicoes_numero_camisa.sql
-- Adiciona número da camisa na inscrição de atletas em competições

alter table public.nadgol_competicoes_atletas
  add column if not exists numero_camisa smallint;
