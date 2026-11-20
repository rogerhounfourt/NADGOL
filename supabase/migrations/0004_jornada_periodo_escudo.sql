-- Jornada: período (início = data, fim = data_fim), escudo do clube e vínculo "aprovado".
alter table public.nadgol_jornada_eventos
  add column if not exists data_fim date,
  add column if not exists escudo_url text;

alter table public.nadgol_jornada_eventos drop constraint if exists nadgol_jornada_vinculo_ck;
alter table public.nadgol_jornada_eventos
  add constraint nadgol_jornada_vinculo_ck check (vinculo is null or vinculo in ('teste','temporada','aprovado'));
