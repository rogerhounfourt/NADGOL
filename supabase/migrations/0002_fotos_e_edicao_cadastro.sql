-- NADGOL 0002 — foto do aluno + edição de cadastro (aluno, responsável e administrador)
-- Rodar uma vez no banco (psql). É seguro rodar de novo: tudo usa "if not exists"/"or replace".

-- ---------------------------------------------------------------------------
-- 1) Bucket de fotos (Supabase Storage). Leitura pública pela URL (o nome do arquivo tem
--    números aleatórios, então a URL não dá para adivinhar); só quem pode gerir o aluno envia.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('nadgol-fotos', 'nadgol-fotos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Caminho do arquivo: <escola_id>/<atleta_id>/<arquivo>.jpg
create or replace function public.nadgol_pode_gerir_foto(p_caminho text)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare v_escola uuid; v_atleta uuid;
begin
  begin
    v_escola := split_part(p_caminho, '/', 1)::uuid;
    v_atleta := split_part(p_caminho, '/', 2)::uuid;
  exception when others then
    return false;
  end;
  if auth.uid() is null then return false; end if;
  if not exists (select 1 from public.nadgol_atletas a where a.id = v_atleta and a.escola_id = v_escola) then
    return false;
  end if;
  return public.nadgol_is_staff(v_escola)
      or (public.nadgol_papel(v_escola) is not null and public.nadgol_is_familia(v_atleta));
end $$;

drop policy if exists nadgol_fotos_sel on storage.objects;
drop policy if exists nadgol_fotos_ins on storage.objects;
drop policy if exists nadgol_fotos_upd on storage.objects;
drop policy if exists nadgol_fotos_del on storage.objects;

create policy nadgol_fotos_sel on storage.objects for select to authenticated
  using (bucket_id = 'nadgol-fotos' and public.nadgol_pode_gerir_foto(name));
create policy nadgol_fotos_ins on storage.objects for insert to authenticated
  with check (bucket_id = 'nadgol-fotos' and public.nadgol_pode_gerir_foto(name));
create policy nadgol_fotos_upd on storage.objects for update to authenticated
  using (bucket_id = 'nadgol-fotos' and public.nadgol_pode_gerir_foto(name))
  with check (bucket_id = 'nadgol-fotos' and public.nadgol_pode_gerir_foto(name));
create policy nadgol_fotos_del on storage.objects for delete to authenticated
  using (bucket_id = 'nadgol-fotos' and public.nadgol_pode_gerir_foto(name));

-- ---------------------------------------------------------------------------
-- 2) Edição do cadastro do atleta, com regra por papel (feita no servidor):
--    - aluno e responsável do atleta: dados pessoais e foto;
--    - treinador: tudo isso + situação (ativo/inativo) e unidade;
--    - administrador: tudo + mensalidade e vencimento.
--    Só os campos enviados em p são alterados.
-- ---------------------------------------------------------------------------
create or replace function public.nadgol_atualizar_atleta(p_atleta uuid, p jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_a public.nadgol_atletas;
  v_staff boolean;
  v_admin boolean;
  v_familia boolean;
begin
  if auth.uid() is null then raise exception 'Não autenticado'; end if;

  select * into v_a from public.nadgol_atletas where id = p_atleta;
  if not found then raise exception 'Atleta não encontrado'; end if;

  v_staff := public.nadgol_is_staff(v_a.escola_id);
  v_admin := public.nadgol_is_admin(v_a.escola_id);
  v_familia := public.nadgol_papel(v_a.escola_id) is not null and public.nadgol_is_familia(p_atleta);

  if not (v_staff or v_familia) then
    raise exception 'Sem permissão para editar este cadastro';
  end if;
  if not v_staff and (p ?| array['status', 'unidade_id']) then
    raise exception 'Somente a equipe altera situação e unidade';
  end if;
  if not v_admin and (p ?| array['valor_mensalidade', 'dia_vencimento']) then
    raise exception 'Somente o administrador altera mensalidade e vencimento';
  end if;
  -- a foto precisa estar na pasta deste atleta
  if p ? 'foto_url' and nullif(p->>'foto_url', '') is not null
     and position('/nadgol-fotos/' || v_a.escola_id::text || '/' || p_atleta::text || '/' in p->>'foto_url') = 0 then
    raise exception 'Foto inválida';
  end if;

  update public.nadgol_atletas set
    nome              = case when p ? 'nome' then trim(p->>'nome') else nome end,
    data_nascimento   = case when p ? 'data_nascimento' then (p->>'data_nascimento')::date else data_nascimento end,
    posicao           = case when p ? 'posicao' then nullif(trim(p->>'posicao'), '') else posicao end,
    pe_dominante      = case when p ? 'pe_dominante' then nullif(trim(p->>'pe_dominante'), '') else pe_dominante end,
    altura_cm         = case when p ? 'altura_cm' then nullif(p->>'altura_cm', '')::numeric else altura_cm end,
    peso_kg           = case when p ? 'peso_kg' then nullif(p->>'peso_kg', '')::numeric else peso_kg end,
    telefone          = case when p ? 'telefone' then nullif(trim(p->>'telefone'), '') else telefone end,
    clube_favorito    = case when p ? 'clube_favorito' then nullif(trim(p->>'clube_favorito'), '') else clube_favorito end,
    sonho             = case when p ? 'sonho' then nullif(trim(p->>'sonho'), '') else sonho end,
    objetivo          = case when p ? 'objetivo' then nullif(trim(p->>'objetivo'), '') else objetivo end,
    observacoes       = case when p ? 'observacoes' then nullif(trim(p->>'observacoes'), '') else observacoes end,
    foto_url          = case when p ? 'foto_url' then nullif(p->>'foto_url', '') else foto_url end,
    status            = case when p ? 'status' then p->>'status' else status end,
    unidade_id        = case when p ? 'unidade_id' then nullif(p->>'unidade_id', '')::uuid else unidade_id end,
    valor_mensalidade = case when p ? 'valor_mensalidade' then nullif(p->>'valor_mensalidade', '')::numeric else valor_mensalidade end,
    dia_vencimento    = case when p ? 'dia_vencimento' then nullif(p->>'dia_vencimento', '')::smallint else dia_vencimento end
  where id = p_atleta;
end $$;

revoke all on function public.nadgol_atualizar_atleta(uuid, jsonb) from public, anon;
grant execute on function public.nadgol_atualizar_atleta(uuid, jsonb) to authenticated;
