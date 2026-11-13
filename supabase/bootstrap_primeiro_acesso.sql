-- NADGOL — primeiro acesso (rode UMA vez, depois da migração 0001)
-- 1) No Supabase Studio: Authentication > Users > "Add user" com seu e-mail e senha.
-- 2) Troque SEU_EMAIL_AQUI abaixo (2 lugares) e rode este arquivo no SQL Editor.
-- Resultado: você vira super admin da plataforma e admin da primeira escolinha.
begin;

insert into public.nadgol_perfis (id, email, nome, super_admin)
select id, email, split_part(email, '@', 1), true
from auth.users where lower(email) = lower('SEU_EMAIL_AQUI')
on conflict (id) do update set super_admin = true;

with escola as (
  insert into public.nadgol_escolas (nome, slug, plano)
  values ('Nadgol Academy', 'nadgol', 'elite')
  on conflict (slug) do update set nome = excluded.nome
  returning id
)
insert into public.nadgol_membros (escola_id, usuario_id, papel)
select escola.id, u.id, 'admin'
from escola, auth.users u
where lower(u.email) = lower('SEU_EMAIL_AQUI')
on conflict (escola_id, usuario_id) do nothing;

commit;
