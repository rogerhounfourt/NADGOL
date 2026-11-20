-- Jornada do atleta: passagens por clubes (clube, tempo no clube, teste ou temporada).
alter table public.nadgol_jornada_eventos
  add column if not exists clube text,
  add column if not exists tempo_no_clube text,
  add column if not exists vinculo text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'nadgol_jornada_vinculo_ck') then
    alter table public.nadgol_jornada_eventos
      add constraint nadgol_jornada_vinculo_ck check (vinculo is null or vinculo in ('teste','temporada'));
  end if;
end $$;
