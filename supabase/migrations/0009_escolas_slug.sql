alter table public.nadgol_escolas add column if not exists slug text;
create unique index if not exists nadgol_escolas_slug_key on public.nadgol_escolas (lower(slug));
alter table public.nadgol_escolas drop constraint if exists nadgol_escolas_slug_formato;
alter table public.nadgol_escolas add constraint nadgol_escolas_slug_formato check (slug is null or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
