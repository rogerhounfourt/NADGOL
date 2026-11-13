-- ============================================================================
-- NADGOL ACADEMY — Schema multi-escola (SaaS)
-- Banco compartilhado (Supabase self-hosted). TODOS os objetos criados aqui
-- começam com "nadgol_". Nada de outros projetos (trans_*, etc.) é alterado.
-- Não cria trigger em auth.users (o projeto TransMenezes já usa um).
-- Roda em uma transação: se algo falhar, nada é aplicado.
-- ============================================================================
begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Utilitários
-- ---------------------------------------------------------------------------
create function public.nadgol_set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Tabelas base
-- ---------------------------------------------------------------------------
create table public.nadgol_escolas (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  logo_url text,
  cor_primaria text not null default '#CC1A1A',
  plano text not null default 'trial' check (plano in ('trial','basico','pro','elite')),
  status text not null default 'ativa' check (status in ('ativa','suspensa','cancelada')),
  trial_ate date,
  gateway_cliente_id text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.nadgol_perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  email text not null default '',
  telefone text,
  avatar_url text,
  super_admin boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.nadgol_unidades (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  nome text not null,
  endereco text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (id, escola_id)
);

create table public.nadgol_atletas (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  unidade_id uuid,
  nome text not null check (char_length(nome) between 2 and 120),
  foto_url text,
  data_nascimento date not null,
  posicao text,
  pe_dominante text check (pe_dominante in ('Direito','Esquerdo','Ambos')),
  altura_cm numeric(5,1),
  peso_kg numeric(5,1),
  telefone text,
  observacoes text,
  objetivo text,
  sonho text,
  clube_favorito text,
  status text not null default 'ativo' check (status in ('ativo','inativo')),
  valor_mensalidade numeric(10,2),
  dia_vencimento smallint check (dia_vencimento between 1 and 28),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (id, escola_id),
  foreign key (unidade_id, escola_id) references public.nadgol_unidades(id, escola_id)
);

-- Vínculo usuário <-> escola, com o papel. É AQUI que mora a permissão.
create table public.nadgol_membros (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  usuario_id uuid not null references public.nadgol_perfis(id) on delete cascade,
  papel text not null check (papel in ('admin','treinador','responsavel','atleta')),
  atleta_id uuid,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (escola_id, usuario_id),
  foreign key (atleta_id, escola_id) references public.nadgol_atletas(id, escola_id),
  check (atleta_id is null or papel = 'atleta')
);

-- Responsável (pai/mãe) <-> atleta
create table public.nadgol_responsaveis (
  usuario_id uuid not null references public.nadgol_perfis(id) on delete cascade,
  atleta_id uuid not null,
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  parentesco text,
  criado_em timestamptz not null default now(),
  primary key (usuario_id, atleta_id),
  foreign key (atleta_id, escola_id) references public.nadgol_atletas(id, escola_id) on delete cascade
);

create table public.nadgol_convites (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  papel text not null check (papel in ('admin','treinador','responsavel','atleta')),
  atleta_id uuid,
  nome text,
  token uuid not null unique default gen_random_uuid(),
  expira_em timestamptz not null default now() + interval '7 days',
  usado_em timestamptz,
  usado_por uuid references public.nadgol_perfis(id),
  criado_por uuid references public.nadgol_perfis(id),
  criado_em timestamptz not null default now(),
  foreign key (atleta_id, escola_id) references public.nadgol_atletas(id, escola_id) on delete cascade,
  check (papel not in ('responsavel','atleta') or atleta_id is not null)
);

create table public.nadgol_turmas (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  unidade_id uuid,
  nome text not null,
  categoria text,
  dia_semana text,
  horario time,
  treinador_id uuid references public.nadgol_perfis(id) on delete set null,
  treinador_nome text,
  max_atletas smallint not null default 20,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (id, escola_id),
  foreign key (unidade_id, escola_id) references public.nadgol_unidades(id, escola_id)
);

create table public.nadgol_turmas_atletas (
  turma_id uuid not null,
  atleta_id uuid not null,
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (turma_id, atleta_id),
  foreign key (turma_id, escola_id) references public.nadgol_turmas(id, escola_id) on delete cascade,
  foreign key (atleta_id, escola_id) references public.nadgol_atletas(id, escola_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Dia a dia
-- ---------------------------------------------------------------------------
create table public.nadgol_presencas (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  turma_id uuid not null,
  atleta_id uuid not null,
  data date not null,
  status text not null check (status in ('presente','ausente','atrasado')),
  desempenho text check (desempenho in ('destaque','otimo','evoluindo','precisa_melhorar')),
  observacao text,
  registrado_por uuid references public.nadgol_perfis(id),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (turma_id, atleta_id, data),
  foreign key (turma_id, escola_id) references public.nadgol_turmas(id, escola_id) on delete cascade,
  foreign key (atleta_id, escola_id) references public.nadgol_atletas(id, escola_id) on delete cascade
);

create table public.nadgol_mensalidades (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  atleta_id uuid not null,
  competencia date not null check (extract(day from competencia) = 1),
  valor numeric(10,2) not null check (valor >= 0),
  vencimento date not null,
  status text not null default 'pendente' check (status in ('pendente','pago','cancelado')),
  pago_em date,
  forma_pagamento text,
  gateway text,
  gateway_cobranca_id text,
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (atleta_id, competencia),
  foreign key (atleta_id, escola_id) references public.nadgol_atletas(id, escola_id) on delete cascade
);

create table public.nadgol_notificacoes (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  titulo text not null,
  mensagem text not null,
  tipo text not null default 'aviso' check (tipo in ('treino','jogo','pagamento','aviso','avaliacao','evento')),
  papeis text[] not null default '{admin,treinador,responsavel,atleta}',
  atleta_id uuid,
  criado_por uuid references public.nadgol_perfis(id),
  criado_em timestamptz not null default now(),
  foreign key (atleta_id, escola_id) references public.nadgol_atletas(id, escola_id) on delete cascade
);

create table public.nadgol_notificacoes_lidas (
  notificacao_id uuid not null references public.nadgol_notificacoes(id) on delete cascade,
  usuario_id uuid not null references public.nadgol_perfis(id) on delete cascade,
  lida_em timestamptz not null default now(),
  primary key (notificacao_id, usuario_id)
);

create table public.nadgol_mensagens (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  sala text not null default 'geral',
  autor_id uuid not null references public.nadgol_perfis(id) on delete cascade,
  autor_nome text not null default '',
  autor_papel text not null default '',
  mensagem text not null check (char_length(mensagem) between 1 and 2000),
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Desempenho
-- ---------------------------------------------------------------------------
create table public.nadgol_avaliacoes_fisicas (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  atleta_id uuid not null,
  data date not null,
  peso_kg numeric(5,1),
  altura_cm numeric(5,1),
  vo2 numeric(5,1),
  velocidade numeric(5,1),
  resistencia numeric(5,1),
  registrado_por uuid references public.nadgol_perfis(id),
  criado_em timestamptz not null default now(),
  foreign key (atleta_id, escola_id) references public.nadgol_atletas(id, escola_id) on delete cascade
);

create table public.nadgol_competicoes (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  nome text not null,
  data date not null,
  local text,
  resultado text,
  criado_em timestamptz not null default now(),
  unique (id, escola_id)
);

create table public.nadgol_competicoes_atletas (
  competicao_id uuid not null,
  atleta_id uuid not null,
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  primary key (competicao_id, atleta_id),
  foreign key (competicao_id, escola_id) references public.nadgol_competicoes(id, escola_id) on delete cascade,
  foreign key (atleta_id, escola_id) references public.nadgol_atletas(id, escola_id) on delete cascade
);

create table public.nadgol_partidas (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  competicao_id uuid,
  adversario text not null,
  data date not null,
  local text,
  placar_pro smallint,
  placar_contra smallint,
  criado_em timestamptz not null default now(),
  unique (id, escola_id),
  foreign key (competicao_id, escola_id) references public.nadgol_competicoes(id, escola_id) on delete set null (competicao_id)
);

-- Estatísticas do atleta por partida (base do NadScore, Scout, Ranking)
create table public.nadgol_partidas_atletas (
  partida_id uuid not null,
  atleta_id uuid not null,
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  minutos smallint not null default 0,
  gols smallint not null default 0,
  assistencias smallint not null default 0,
  finalizacoes smallint not null default 0,
  passes_certos smallint not null default 0,
  passes_total smallint not null default 0,
  desarmes smallint not null default 0,
  defesas smallint not null default 0,
  cartoes_amarelos smallint not null default 0,
  cartoes_vermelhos smallint not null default 0,
  nota numeric(3,1) check (nota between 0 and 10),
  mapa_calor jsonb,
  autoavaliacao jsonb,
  primary key (partida_id, atleta_id),
  foreign key (partida_id, escola_id) references public.nadgol_partidas(id, escola_id) on delete cascade,
  foreign key (atleta_id, escola_id) references public.nadgol_atletas(id, escola_id) on delete cascade
);

-- Avaliações do treinador (técnica, tática, mentalidade, disciplina)
create table public.nadgol_avaliacoes (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  atleta_id uuid not null,
  tipo text not null check (tipo in ('tecnica','tatica','fisica','mentalidade','disciplina')),
  data date not null default current_date,
  criterios jsonb not null default '{}',
  nota numeric(4,1) check (nota between 0 and 100),
  comentario text,
  avaliador_id uuid references public.nadgol_perfis(id),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  foreign key (atleta_id, escola_id) references public.nadgol_atletas(id, escola_id) on delete cascade
);

create table public.nadgol_jornada_eventos (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  atleta_id uuid not null,
  data date not null,
  tipo text not null default 'marco',
  titulo text not null,
  descricao text,
  midia_url text,
  criado_em timestamptz not null default now(),
  foreign key (atleta_id, escola_id) references public.nadgol_atletas(id, escola_id) on delete cascade
);

create table public.nadgol_quadros_taticos (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  turma_id uuid,
  nome text not null,
  formacao text not null default '4-3-3',
  dados jsonb not null default '{}',
  criado_por uuid references public.nadgol_perfis(id),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  foreign key (turma_id, escola_id) references public.nadgol_turmas(id, escola_id) on delete set null (turma_id)
);

-- ---------------------------------------------------------------------------
-- Lifestyle e gamificação (XP e Coins só são gravados pelo servidor/staff)
-- ---------------------------------------------------------------------------
create table public.nadgol_performance_diaria (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  atleta_id uuid not null,
  data date not null default current_date,
  sono_horas numeric(3,1) check (sono_horas between 0 and 24),
  agua_litros numeric(3,1) check (agua_litros between 0 and 15),
  alimentacao_nota smallint check (alimentacao_nota between 1 and 5),
  tela_horas numeric(3,1) check (tela_horas between 0 and 24),
  humor smallint check (humor between 1 and 5),
  criado_em timestamptz not null default now(),
  unique (atleta_id, data),
  foreign key (atleta_id, escola_id) references public.nadgol_atletas(id, escola_id) on delete cascade
);

create table public.nadgol_xp_eventos (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  atleta_id uuid not null,
  origem text not null,
  referencia_id uuid,
  xp integer not null default 0,
  coins integer not null default 0,
  descricao text,
  criado_em timestamptz not null default now(),
  foreign key (atleta_id, escola_id) references public.nadgol_atletas(id, escola_id) on delete cascade
);

create table public.nadgol_conquistas (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid references public.nadgol_escolas(id) on delete cascade, -- null = global
  codigo text not null,
  nome text not null,
  descricao text,
  icone text,
  xp integer not null default 0,
  unique (escola_id, codigo)
);

create table public.nadgol_atletas_conquistas (
  atleta_id uuid not null,
  conquista_id uuid not null references public.nadgol_conquistas(id) on delete cascade,
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  desbloqueada_em timestamptz not null default now(),
  primary key (atleta_id, conquista_id),
  foreign key (atleta_id, escola_id) references public.nadgol_atletas(id, escola_id) on delete cascade
);

create table public.nadgol_mindgame_desafios (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid references public.nadgol_escolas(id) on delete cascade, -- null = global
  titulo text not null,
  cenario text not null,
  opcoes jsonb not null,
  dificuldade text not null default 'medio' check (dificuldade in ('facil','medio','dificil')),
  xp integer not null default 20,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- Gabarito separado: o atleta nunca consegue ler a resposta antes de responder
create table public.nadgol_mindgame_gabaritos (
  desafio_id uuid primary key references public.nadgol_mindgame_desafios(id) on delete cascade,
  opcao_correta smallint not null,
  explicacao text
);

create table public.nadgol_mindgame_respostas (
  desafio_id uuid not null references public.nadgol_mindgame_desafios(id) on delete cascade,
  atleta_id uuid not null,
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,
  opcao smallint not null,
  correta boolean not null,
  criado_em timestamptz not null default now(),
  primary key (desafio_id, atleta_id),
  foreign key (atleta_id, escola_id) references public.nadgol_atletas(id, escola_id) on delete cascade
);

create table public.nadgol_auditoria (
  id bigint generated always as identity primary key,
  escola_id uuid,
  usuario_id uuid,
  tabela text not null,
  registro_id text,
  acao text not null,
  antes jsonb,
  depois jsonb,
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------
create index nadgol_membros_usuario_idx on public.nadgol_membros (usuario_id) where ativo;
create index nadgol_responsaveis_atleta_idx on public.nadgol_responsaveis (atleta_id);
create index nadgol_unidades_escola_idx on public.nadgol_unidades (escola_id);
create index nadgol_atletas_escola_idx on public.nadgol_atletas (escola_id, status, nome);
create index nadgol_turmas_escola_idx on public.nadgol_turmas (escola_id);
create index nadgol_turmas_treinador_idx on public.nadgol_turmas (treinador_id);
create index nadgol_turmas_atletas_atleta_idx on public.nadgol_turmas_atletas (atleta_id);
create index nadgol_presencas_escola_data_idx on public.nadgol_presencas (escola_id, data desc);
create index nadgol_presencas_atleta_idx on public.nadgol_presencas (atleta_id, data desc);
create index nadgol_mensalidades_escola_idx on public.nadgol_mensalidades (escola_id, competencia desc, status);
create index nadgol_notificacoes_escola_idx on public.nadgol_notificacoes (escola_id, criado_em desc);
create index nadgol_mensagens_sala_idx on public.nadgol_mensagens (escola_id, sala, criado_em desc);
create index nadgol_aval_fisicas_atleta_idx on public.nadgol_avaliacoes_fisicas (atleta_id, data desc);
create index nadgol_competicoes_escola_idx on public.nadgol_competicoes (escola_id, data desc);
create index nadgol_partidas_escola_idx on public.nadgol_partidas (escola_id, data desc);
create index nadgol_partidas_atletas_atleta_idx on public.nadgol_partidas_atletas (atleta_id);
create index nadgol_avaliacoes_atleta_idx on public.nadgol_avaliacoes (atleta_id, tipo, data desc);
create index nadgol_jornada_atleta_idx on public.nadgol_jornada_eventos (atleta_id, data desc);
create index nadgol_quadros_escola_idx on public.nadgol_quadros_taticos (escola_id);
create index nadgol_perf_diaria_atleta_idx on public.nadgol_performance_diaria (atleta_id, data desc);
create index nadgol_xp_atleta_idx on public.nadgol_xp_eventos (atleta_id, criado_em desc);
create index nadgol_convites_escola_idx on public.nadgol_convites (escola_id);
create index nadgol_auditoria_escola_idx on public.nadgol_auditoria (escola_id, criado_em desc);

-- ---------------------------------------------------------------------------
-- Funções de permissão (security definer: leem nadgol_membros sem recursão de RLS)
-- ---------------------------------------------------------------------------
create function public.nadgol_is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.nadgol_perfis where id = auth.uid() and super_admin);
$$;

create function public.nadgol_papel(p_escola uuid)
returns text language sql stable security definer set search_path = public as $$
  select m.papel
  from public.nadgol_membros m
  join public.nadgol_escolas e on e.id = m.escola_id
  where m.usuario_id = auth.uid() and m.escola_id = p_escola and m.ativo and e.status = 'ativa';
$$;

create function public.nadgol_is_membro(p_escola uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.nadgol_is_super_admin() or public.nadgol_papel(p_escola) is not null;
$$;

create function public.nadgol_is_admin(p_escola uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.nadgol_is_super_admin() or coalesce(public.nadgol_papel(p_escola) = 'admin', false);
$$;

create function public.nadgol_is_staff(p_escola uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.nadgol_is_super_admin() or coalesce(public.nadgol_papel(p_escola) in ('admin','treinador'), false);
$$;

-- Responsável do atleta, ou o próprio atleta
create function public.nadgol_is_familia(p_atleta uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.nadgol_responsaveis r
    join public.nadgol_membros m on m.usuario_id = r.usuario_id and m.escola_id = r.escola_id and m.ativo
    where r.usuario_id = auth.uid() and r.atleta_id = p_atleta
  ) or exists (
    select 1 from public.nadgol_membros m
    where m.usuario_id = auth.uid() and m.atleta_id = p_atleta and m.ativo
  );
$$;

create function public.nadgol_is_responsavel(p_atleta uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.nadgol_responsaveis r
    join public.nadgol_membros m on m.usuario_id = r.usuario_id and m.escola_id = r.escola_id and m.ativo
    where r.usuario_id = auth.uid() and r.atleta_id = p_atleta
  );
$$;

-- Admin/treinador da escola veem o atleta; a família vê só o seu atleta
create function public.nadgol_pode_ver_atleta(p_atleta uuid, p_escola uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.nadgol_is_staff(p_escola) or (public.nadgol_papel(p_escola) is not null and public.nadgol_is_familia(p_atleta));
$$;

create function public.nadgol_pode_ver_perfil(p_alvo uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select p_alvo = auth.uid()
    or public.nadgol_is_super_admin()
    or exists (
      select 1
      from public.nadgol_membros eu
      join public.nadgol_membros ele on ele.escola_id = eu.escola_id
      where eu.usuario_id = auth.uid() and eu.ativo
        and ele.usuario_id = p_alvo and ele.ativo
        and (eu.papel in ('admin','treinador') or ele.papel in ('admin','treinador'))
    );
$$;

-- ---------------------------------------------------------------------------
-- Triggers de proteção
-- ---------------------------------------------------------------------------
-- Ninguém se promove a super admin pelo app (só pelo SQL Editor / service role)
create function public.nadgol_protege_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.nadgol_is_super_admin() then
    if tg_op = 'INSERT' then
      new.super_admin := false;
    elsif new.super_admin is distinct from old.super_admin or new.id <> old.id then
      raise exception 'Operação não permitida';
    end if;
  end if;
  return new;
end $$;
create trigger nadgol_perfis_protege before insert or update on public.nadgol_perfis
  for each row execute function public.nadgol_protege_perfil();

-- Admin da escola edita nome/logo, mas plano e status só o super admin
create function public.nadgol_protege_escola()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.nadgol_is_super_admin() then
    if new.plano is distinct from old.plano or new.status is distinct from old.status
       or new.trial_ate is distinct from old.trial_ate or new.gateway_cliente_id is distinct from old.gateway_cliente_id
       or new.slug is distinct from old.slug then
      raise exception 'Somente o administrador da plataforma altera plano e status';
    end if;
  end if;
  return new;
end $$;
create trigger nadgol_escolas_protege before update on public.nadgol_escolas
  for each row execute function public.nadgol_protege_escola();

-- Mensagens do chat: autor, nome e papel vêm do servidor, nunca do cliente
create function public.nadgol_mensagem_autor()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.autor_id := auth.uid();
  new.criado_em := now();
  select p.nome into new.autor_nome from public.nadgol_perfis p where p.id = auth.uid();
  new.autor_papel := coalesce(public.nadgol_papel(new.escola_id), case when public.nadgol_is_super_admin() then 'admin' else '' end);
  return new;
end $$;
create trigger nadgol_mensagens_autor before insert on public.nadgol_mensagens
  for each row execute function public.nadgol_mensagem_autor();

-- Auditoria
create function public.nadgol_auditar()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_antes jsonb := case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end;
  v_depois jsonb := case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end;
begin
  insert into public.nadgol_auditoria (escola_id, usuario_id, tabela, registro_id, acao, antes, depois)
  values (
    coalesce((v_depois->>'escola_id')::uuid, (v_antes->>'escola_id')::uuid),
    auth.uid(), tg_table_name,
    coalesce(v_depois->>'id', v_antes->>'id'),
    tg_op, v_antes, v_depois
  );
  return coalesce(new, old);
end $$;

create trigger nadgol_auditar_atletas after insert or update or delete on public.nadgol_atletas for each row execute function public.nadgol_auditar();
create trigger nadgol_auditar_membros after insert or update or delete on public.nadgol_membros for each row execute function public.nadgol_auditar();
create trigger nadgol_auditar_presencas after insert or update or delete on public.nadgol_presencas for each row execute function public.nadgol_auditar();
create trigger nadgol_auditar_mensalidades after insert or update or delete on public.nadgol_mensalidades for each row execute function public.nadgol_auditar();
create trigger nadgol_auditar_avaliacoes after insert or update or delete on public.nadgol_avaliacoes for each row execute function public.nadgol_auditar();

-- atualizado_em
create trigger nadgol_escolas_upd before update on public.nadgol_escolas for each row execute function public.nadgol_set_atualizado_em();
create trigger nadgol_perfis_upd before update on public.nadgol_perfis for each row execute function public.nadgol_set_atualizado_em();
create trigger nadgol_atletas_upd before update on public.nadgol_atletas for each row execute function public.nadgol_set_atualizado_em();
create trigger nadgol_turmas_upd before update on public.nadgol_turmas for each row execute function public.nadgol_set_atualizado_em();
create trigger nadgol_presencas_upd before update on public.nadgol_presencas for each row execute function public.nadgol_set_atualizado_em();
create trigger nadgol_mensalidades_upd before update on public.nadgol_mensalidades for each row execute function public.nadgol_set_atualizado_em();
create trigger nadgol_avaliacoes_upd before update on public.nadgol_avaliacoes for each row execute function public.nadgol_set_atualizado_em();
create trigger nadgol_quadros_upd before update on public.nadgol_quadros_taticos for each row execute function public.nadgol_set_atualizado_em();

-- XP automático ao registrar a performance diária (calculado no servidor)
create function public.nadgol_xp_performance_diaria()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.nadgol_xp_eventos (escola_id, atleta_id, origem, referencia_id, xp, coins, descricao)
  values (new.escola_id, new.atleta_id, 'performance_diaria', new.id, 10, 2, 'Registro diário de hábitos');
  return new;
end $$;
create trigger nadgol_perf_diaria_xp after insert on public.nadgol_performance_diaria
  for each row execute function public.nadgol_xp_performance_diaria();

-- ---------------------------------------------------------------------------
-- RPCs (ações que o app chama)
-- ---------------------------------------------------------------------------
-- Cria/atualiza o perfil do usuário logado (substitui o trigger em auth.users)
create function public.nadgol_garantir_perfil(p_nome text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_email text;
begin
  if auth.uid() is null then raise exception 'Não autenticado'; end if;
  select email into v_email from auth.users where id = auth.uid();
  insert into public.nadgol_perfis (id, email, nome)
  values (auth.uid(), coalesce(v_email, ''), coalesce(nullif(trim(p_nome), ''), split_part(coalesce(v_email, ''), '@', 1)))
  on conflict (id) do update
    set email = excluded.email,
        nome = case when nullif(trim(p_nome), '') is not null then trim(p_nome) else public.nadgol_perfis.nome end;
end $$;

-- Aceita um convite (link enviado pelo admin da escola)
create function public.nadgol_aceitar_convite(p_token uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare c public.nadgol_convites;
begin
  if auth.uid() is null then raise exception 'Não autenticado'; end if;
  perform public.nadgol_garantir_perfil();

  select * into c from public.nadgol_convites
  where token = p_token and usado_em is null and expira_em > now()
  for update;
  if not found then raise exception 'Convite inválido ou expirado'; end if;

  insert into public.nadgol_membros (escola_id, usuario_id, papel, atleta_id)
  values (c.escola_id, auth.uid(), c.papel, case when c.papel = 'atleta' then c.atleta_id end)
  on conflict (escola_id, usuario_id) do nothing;

  if c.papel = 'responsavel' then
    insert into public.nadgol_responsaveis (usuario_id, atleta_id, escola_id)
    values (auth.uid(), c.atleta_id, c.escola_id)
    on conflict do nothing;
  end if;

  update public.nadgol_convites set usado_em = now(), usado_por = auth.uid() where id = c.id;
  return c.escola_id;
end $$;

-- Dados mínimos do convite para a tela de cadastro (sem expor nada além do nome da escola)
create function public.nadgol_ver_convite(p_token uuid)
returns table (escola_nome text, papel text, nome text)
language sql stable security definer set search_path = public as $$
  select e.nome, c.papel, c.nome
  from public.nadgol_convites c join public.nadgol_escolas e on e.id = c.escola_id
  where c.token = p_token and c.usado_em is null and c.expira_em > now();
$$;

-- Presença em lote (uma chamada salva a turma inteira)
create function public.nadgol_salvar_presencas(p_turma uuid, p_data date, p_itens jsonb)
returns integer language plpgsql security definer set search_path = public as $$
declare v_escola uuid; v_n integer;
begin
  select escola_id into v_escola from public.nadgol_turmas where id = p_turma;
  if v_escola is null or not public.nadgol_is_staff(v_escola) then
    raise exception 'Sem permissão para esta turma';
  end if;

  insert into public.nadgol_presencas (escola_id, turma_id, atleta_id, data, status, desempenho, registrado_por)
  select v_escola, p_turma, (i->>'atleta_id')::uuid, p_data, i->>'status', nullif(i->>'desempenho', ''), auth.uid()
  from jsonb_array_elements(p_itens) i
  where exists (select 1 from public.nadgol_turmas_atletas ta where ta.turma_id = p_turma and ta.atleta_id = (i->>'atleta_id')::uuid)
  on conflict (turma_id, atleta_id, data) do update
    set status = excluded.status, desempenho = excluded.desempenho, registrado_por = excluded.registrado_por;
  get diagnostics v_n = row_count;
  return v_n;
end $$;

-- Gera as mensalidades do mês para todos os atletas ativos com valor definido
create function public.nadgol_gerar_mensalidades(p_escola uuid, p_competencia date)
returns integer language plpgsql security definer set search_path = public as $$
declare v_comp date := date_trunc('month', p_competencia)::date; v_n integer;
begin
  if not public.nadgol_is_admin(p_escola) then raise exception 'Sem permissão'; end if;
  insert into public.nadgol_mensalidades (escola_id, atleta_id, competencia, valor, vencimento)
  select a.escola_id, a.id, v_comp, a.valor_mensalidade, v_comp + (coalesce(a.dia_vencimento, 10) - 1)
  from public.nadgol_atletas a
  where a.escola_id = p_escola and a.status = 'ativo' and a.valor_mensalidade is not null
  on conflict (atleta_id, competencia) do nothing;
  get diagnostics v_n = row_count;
  return v_n;
end $$;

-- Mind Game: confere a resposta no servidor e credita o XP
create function public.nadgol_responder_mindgame(p_desafio uuid, p_atleta uuid, p_opcao smallint)
returns table (correta boolean, opcao_correta smallint, explicacao text, xp integer)
language plpgsql security definer set search_path = public as $$
declare v_escola uuid; g public.nadgol_mindgame_gabaritos; v_xp integer; v_ok boolean;
begin
  select a.escola_id into v_escola from public.nadgol_atletas a where a.id = p_atleta;
  if v_escola is null or not exists (
    select 1 from public.nadgol_membros m where m.usuario_id = auth.uid() and m.atleta_id = p_atleta and m.ativo
  ) then raise exception 'Sem permissão'; end if;

  select d.xp into v_xp from public.nadgol_mindgame_desafios d
  where d.id = p_desafio and d.ativo and (d.escola_id is null or d.escola_id = v_escola);
  if not found then raise exception 'Desafio indisponível'; end if;
  select * into g from public.nadgol_mindgame_gabaritos where desafio_id = p_desafio;
  v_ok := (g.opcao_correta = p_opcao);

  insert into public.nadgol_mindgame_respostas (desafio_id, atleta_id, escola_id, opcao, correta)
  values (p_desafio, p_atleta, v_escola, p_opcao, v_ok);  -- PK impede responder duas vezes

  if v_ok then
    insert into public.nadgol_xp_eventos (escola_id, atleta_id, origem, referencia_id, xp, coins, descricao)
    values (v_escola, p_atleta, 'mindgame', p_desafio, v_xp, v_xp / 5, 'Desafio tático resolvido');
  end if;
  return query select v_ok, g.opcao_correta, g.explicacao, case when v_ok then v_xp else 0 end;
end $$;

-- Ranking da escola: qualquer membro vê, mas só campos esportivos
create function public.nadgol_ranking(p_escola uuid)
returns table (atleta_id uuid, nome text, foto_url text, posicao text, data_nascimento date,
               gols bigint, assistencias bigint, jogos bigint, presenca_pct numeric, xp bigint)
language sql stable security definer set search_path = public as $$
  select a.id, a.nome, a.foto_url, a.posicao, a.data_nascimento,
    coalesce(pa.gols, 0), coalesce(pa.assistencias, 0), coalesce(pa.jogos, 0),
    pr.pct, coalesce(x.xp, 0)
  from public.nadgol_atletas a
  left join lateral (select sum(gols) gols, sum(assistencias) assistencias, count(*) jogos
                     from public.nadgol_partidas_atletas where atleta_id = a.id) pa on true
  left join lateral (select round(100.0 * count(*) filter (where status <> 'ausente') / nullif(count(*), 0), 0) pct
                     from public.nadgol_presencas where atleta_id = a.id) pr on true
  left join lateral (select sum(xp) xp from public.nadgol_xp_eventos where atleta_id = a.id) x on true
  where a.escola_id = p_escola and a.status = 'ativo' and public.nadgol_is_membro(p_escola)
  order by coalesce(pa.gols, 0) * 3 + coalesce(pa.assistencias, 0) * 2 + coalesce(x.xp, 0) / 50.0 desc, a.nome;
$$;

-- ---------------------------------------------------------------------------
-- View: atleta + números agregados (respeita o RLS de quem consulta)
-- ---------------------------------------------------------------------------
create view public.nadgol_atletas_resumo with (security_invoker = true) as
select a.*,
  u.nome as unidade_nome,
  (select ta.turma_id from public.nadgol_turmas_atletas ta where ta.atleta_id = a.id order by ta.criado_em limit 1) as turma_id,
  coalesce((select sum(pa.gols) from public.nadgol_partidas_atletas pa where pa.atleta_id = a.id), 0)::int as gols,
  coalesce((select sum(pa.assistencias) from public.nadgol_partidas_atletas pa where pa.atleta_id = a.id), 0)::int as assistencias,
  (select round(100.0 * count(*) filter (where p.status <> 'ausente') / nullif(count(*), 0), 0)
     from public.nadgol_presencas p where p.atleta_id = a.id)::int as presenca_pct,
  coalesce((select sum(x.xp) from public.nadgol_xp_eventos x where x.atleta_id = a.id), 0)::int as xp
from public.nadgol_atletas a
left join public.nadgol_unidades u on u.id = a.unidade_id;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.nadgol_escolas enable row level security;
alter table public.nadgol_perfis enable row level security;
alter table public.nadgol_unidades enable row level security;
alter table public.nadgol_atletas enable row level security;
alter table public.nadgol_membros enable row level security;
alter table public.nadgol_responsaveis enable row level security;
alter table public.nadgol_convites enable row level security;
alter table public.nadgol_turmas enable row level security;
alter table public.nadgol_turmas_atletas enable row level security;
alter table public.nadgol_presencas enable row level security;
alter table public.nadgol_mensalidades enable row level security;
alter table public.nadgol_notificacoes enable row level security;
alter table public.nadgol_notificacoes_lidas enable row level security;
alter table public.nadgol_mensagens enable row level security;
alter table public.nadgol_avaliacoes_fisicas enable row level security;
alter table public.nadgol_competicoes enable row level security;
alter table public.nadgol_competicoes_atletas enable row level security;
alter table public.nadgol_partidas enable row level security;
alter table public.nadgol_partidas_atletas enable row level security;
alter table public.nadgol_avaliacoes enable row level security;
alter table public.nadgol_jornada_eventos enable row level security;
alter table public.nadgol_quadros_taticos enable row level security;
alter table public.nadgol_performance_diaria enable row level security;
alter table public.nadgol_xp_eventos enable row level security;
alter table public.nadgol_conquistas enable row level security;
alter table public.nadgol_atletas_conquistas enable row level security;
alter table public.nadgol_mindgame_desafios enable row level security;
alter table public.nadgol_mindgame_gabaritos enable row level security;
alter table public.nadgol_mindgame_respostas enable row level security;
alter table public.nadgol_auditoria enable row level security;

-- Escolas
create policy nadgol_escolas_sel on public.nadgol_escolas for select to authenticated using (public.nadgol_is_membro(id));
create policy nadgol_escolas_ins on public.nadgol_escolas for insert to authenticated with check (public.nadgol_is_super_admin());
create policy nadgol_escolas_upd on public.nadgol_escolas for update to authenticated using (public.nadgol_is_admin(id)) with check (public.nadgol_is_admin(id));
create policy nadgol_escolas_del on public.nadgol_escolas for delete to authenticated using (public.nadgol_is_super_admin());

-- Perfis (criação só via nadgol_garantir_perfil)
create policy nadgol_perfis_sel on public.nadgol_perfis for select to authenticated using (public.nadgol_pode_ver_perfil(id));
create policy nadgol_perfis_upd on public.nadgol_perfis for update to authenticated using (id = auth.uid() or public.nadgol_is_super_admin()) with check (id = auth.uid() or public.nadgol_is_super_admin());

-- Membros
create policy nadgol_membros_sel on public.nadgol_membros for select to authenticated using (usuario_id = auth.uid() or public.nadgol_is_staff(escola_id));
create policy nadgol_membros_ins on public.nadgol_membros for insert to authenticated with check (public.nadgol_is_admin(escola_id));
create policy nadgol_membros_upd on public.nadgol_membros for update to authenticated using (public.nadgol_is_admin(escola_id)) with check (public.nadgol_is_admin(escola_id));
create policy nadgol_membros_del on public.nadgol_membros for delete to authenticated using (public.nadgol_is_admin(escola_id));

-- Responsáveis
create policy nadgol_responsaveis_sel on public.nadgol_responsaveis for select to authenticated using (usuario_id = auth.uid() or public.nadgol_is_staff(escola_id));
create policy nadgol_responsaveis_ins on public.nadgol_responsaveis for insert to authenticated with check (public.nadgol_is_admin(escola_id));
create policy nadgol_responsaveis_del on public.nadgol_responsaveis for delete to authenticated using (public.nadgol_is_admin(escola_id));

-- Convites (só admin da escola)
create policy nadgol_convites_all on public.nadgol_convites for all to authenticated using (public.nadgol_is_admin(escola_id)) with check (public.nadgol_is_admin(escola_id));

-- Unidades, turmas, competições, partidas: membros leem, staff/admin escrevem
create policy nadgol_unidades_sel on public.nadgol_unidades for select to authenticated using (public.nadgol_is_membro(escola_id));
create policy nadgol_unidades_wr on public.nadgol_unidades for all to authenticated using (public.nadgol_is_admin(escola_id)) with check (public.nadgol_is_admin(escola_id));

create policy nadgol_turmas_sel on public.nadgol_turmas for select to authenticated using (public.nadgol_is_membro(escola_id));
create policy nadgol_turmas_wr on public.nadgol_turmas for all to authenticated using (public.nadgol_is_admin(escola_id)) with check (public.nadgol_is_admin(escola_id));

create policy nadgol_turmas_atletas_sel on public.nadgol_turmas_atletas for select to authenticated using (public.nadgol_pode_ver_atleta(atleta_id, escola_id));
create policy nadgol_turmas_atletas_wr on public.nadgol_turmas_atletas for all to authenticated using (public.nadgol_is_staff(escola_id)) with check (public.nadgol_is_staff(escola_id));

create policy nadgol_competicoes_sel on public.nadgol_competicoes for select to authenticated using (public.nadgol_is_membro(escola_id));
create policy nadgol_competicoes_wr on public.nadgol_competicoes for all to authenticated using (public.nadgol_is_staff(escola_id)) with check (public.nadgol_is_staff(escola_id));

create policy nadgol_partidas_sel on public.nadgol_partidas for select to authenticated using (public.nadgol_is_membro(escola_id));
create policy nadgol_partidas_wr on public.nadgol_partidas for all to authenticated using (public.nadgol_is_staff(escola_id)) with check (public.nadgol_is_staff(escola_id));

-- Atletas: staff vê todos da escola; família vê só o seu
create policy nadgol_atletas_sel on public.nadgol_atletas for select to authenticated using (public.nadgol_pode_ver_atleta(id, escola_id));
create policy nadgol_atletas_ins on public.nadgol_atletas for insert to authenticated with check (public.nadgol_is_staff(escola_id));
create policy nadgol_atletas_upd on public.nadgol_atletas for update to authenticated using (public.nadgol_is_staff(escola_id)) with check (public.nadgol_is_staff(escola_id));
create policy nadgol_atletas_del on public.nadgol_atletas for delete to authenticated using (public.nadgol_is_admin(escola_id));

-- Dados do atleta: leitura por quem pode ver o atleta, escrita pelo staff
create policy nadgol_presencas_sel on public.nadgol_presencas for select to authenticated using (public.nadgol_pode_ver_atleta(atleta_id, escola_id));
create policy nadgol_presencas_wr on public.nadgol_presencas for all to authenticated using (public.nadgol_is_staff(escola_id)) with check (public.nadgol_is_staff(escola_id));

create policy nadgol_aval_fisicas_sel on public.nadgol_avaliacoes_fisicas for select to authenticated using (public.nadgol_pode_ver_atleta(atleta_id, escola_id));
create policy nadgol_aval_fisicas_wr on public.nadgol_avaliacoes_fisicas for all to authenticated using (public.nadgol_is_staff(escola_id)) with check (public.nadgol_is_staff(escola_id));

create policy nadgol_comp_atletas_sel on public.nadgol_competicoes_atletas for select to authenticated using (public.nadgol_pode_ver_atleta(atleta_id, escola_id));
create policy nadgol_comp_atletas_wr on public.nadgol_competicoes_atletas for all to authenticated using (public.nadgol_is_staff(escola_id)) with check (public.nadgol_is_staff(escola_id));

create policy nadgol_part_atletas_sel on public.nadgol_partidas_atletas for select to authenticated using (public.nadgol_pode_ver_atleta(atleta_id, escola_id));
create policy nadgol_part_atletas_wr on public.nadgol_partidas_atletas for all to authenticated using (public.nadgol_is_staff(escola_id)) with check (public.nadgol_is_staff(escola_id));

create policy nadgol_avaliacoes_sel on public.nadgol_avaliacoes for select to authenticated using (public.nadgol_pode_ver_atleta(atleta_id, escola_id));
create policy nadgol_avaliacoes_wr on public.nadgol_avaliacoes for all to authenticated using (public.nadgol_is_staff(escola_id)) with check (public.nadgol_is_staff(escola_id));

create policy nadgol_jornada_sel on public.nadgol_jornada_eventos for select to authenticated using (public.nadgol_pode_ver_atleta(atleta_id, escola_id));
create policy nadgol_jornada_wr on public.nadgol_jornada_eventos for all to authenticated using (public.nadgol_is_staff(escola_id)) with check (public.nadgol_is_staff(escola_id));

create policy nadgol_quadros_all on public.nadgol_quadros_taticos for all to authenticated using (public.nadgol_is_staff(escola_id)) with check (public.nadgol_is_staff(escola_id));

-- Financeiro: admin da escola e o responsável do atleta. Treinador e atleta NÃO veem.
create policy nadgol_mensalidades_sel on public.nadgol_mensalidades for select to authenticated using (public.nadgol_is_admin(escola_id) or public.nadgol_is_responsavel(atleta_id));
create policy nadgol_mensalidades_wr on public.nadgol_mensalidades for all to authenticated using (public.nadgol_is_admin(escola_id)) with check (public.nadgol_is_admin(escola_id));

-- Notificações
create policy nadgol_notificacoes_sel on public.nadgol_notificacoes for select to authenticated using (
  public.nadgol_is_staff(escola_id)
  or (public.nadgol_papel(escola_id) = any (papeis) and (atleta_id is null or public.nadgol_is_familia(atleta_id)))
);
create policy nadgol_notificacoes_wr on public.nadgol_notificacoes for all to authenticated using (public.nadgol_is_staff(escola_id)) with check (public.nadgol_is_staff(escola_id));

create policy nadgol_notif_lidas_sel on public.nadgol_notificacoes_lidas for select to authenticated using (usuario_id = auth.uid());
create policy nadgol_notif_lidas_ins on public.nadgol_notificacoes_lidas for insert to authenticated with check (usuario_id = auth.uid());
create policy nadgol_notif_lidas_del on public.nadgol_notificacoes_lidas for delete to authenticated using (usuario_id = auth.uid());

-- Chat
create policy nadgol_mensagens_sel on public.nadgol_mensagens for select to authenticated using (public.nadgol_is_membro(escola_id));
create policy nadgol_mensagens_ins on public.nadgol_mensagens for insert to authenticated with check (public.nadgol_is_membro(escola_id));
create policy nadgol_mensagens_del on public.nadgol_mensagens for delete to authenticated using (public.nadgol_is_admin(escola_id));

-- Lifestyle: família registra e vê; staff vê
create policy nadgol_perf_diaria_sel on public.nadgol_performance_diaria for select to authenticated using (public.nadgol_pode_ver_atleta(atleta_id, escola_id));
create policy nadgol_perf_diaria_ins on public.nadgol_performance_diaria for insert to authenticated with check (public.nadgol_papel(escola_id) is not null and public.nadgol_is_familia(atleta_id));
create policy nadgol_perf_diaria_upd on public.nadgol_performance_diaria for update to authenticated using (public.nadgol_is_familia(atleta_id) and data = current_date) with check (public.nadgol_is_familia(atleta_id) and data = current_date);

-- XP: leitura por quem vê o atleta; escrita manual só staff (o resto vem de triggers/RPC)
create policy nadgol_xp_sel on public.nadgol_xp_eventos for select to authenticated using (public.nadgol_pode_ver_atleta(atleta_id, escola_id));
create policy nadgol_xp_ins on public.nadgol_xp_eventos for insert to authenticated with check (public.nadgol_is_staff(escola_id));

create policy nadgol_conquistas_sel on public.nadgol_conquistas for select to authenticated using (escola_id is null or public.nadgol_is_membro(escola_id));
create policy nadgol_conquistas_wr on public.nadgol_conquistas for all to authenticated
  using ((escola_id is null and public.nadgol_is_super_admin()) or (escola_id is not null and public.nadgol_is_admin(escola_id)))
  with check ((escola_id is null and public.nadgol_is_super_admin()) or (escola_id is not null and public.nadgol_is_admin(escola_id)));

create policy nadgol_atl_conquistas_sel on public.nadgol_atletas_conquistas for select to authenticated using (public.nadgol_pode_ver_atleta(atleta_id, escola_id));
create policy nadgol_atl_conquistas_wr on public.nadgol_atletas_conquistas for all to authenticated using (public.nadgol_is_staff(escola_id)) with check (public.nadgol_is_staff(escola_id));

create policy nadgol_mg_desafios_sel on public.nadgol_mindgame_desafios for select to authenticated using (escola_id is null or public.nadgol_is_membro(escola_id));
create policy nadgol_mg_desafios_wr on public.nadgol_mindgame_desafios for all to authenticated
  using ((escola_id is null and public.nadgol_is_super_admin()) or (escola_id is not null and public.nadgol_is_staff(escola_id)))
  with check ((escola_id is null and public.nadgol_is_super_admin()) or (escola_id is not null and public.nadgol_is_staff(escola_id)));

create policy nadgol_mg_gabaritos_all on public.nadgol_mindgame_gabaritos for all to authenticated
  using (exists (select 1 from public.nadgol_mindgame_desafios d where d.id = desafio_id
                 and ((d.escola_id is null and public.nadgol_is_super_admin()) or (d.escola_id is not null and public.nadgol_is_staff(d.escola_id)))))
  with check (exists (select 1 from public.nadgol_mindgame_desafios d where d.id = desafio_id
                 and ((d.escola_id is null and public.nadgol_is_super_admin()) or (d.escola_id is not null and public.nadgol_is_staff(d.escola_id)))));

create policy nadgol_mg_respostas_sel on public.nadgol_mindgame_respostas for select to authenticated using (public.nadgol_pode_ver_atleta(atleta_id, escola_id));

-- Auditoria: só leitura, só admin
create policy nadgol_auditoria_sel on public.nadgol_auditoria for select to authenticated using (escola_id is not null and public.nadgol_is_admin(escola_id));

-- ---------------------------------------------------------------------------
-- Privilégios: visitante anônimo não enxerga nada do NADGOL
-- ---------------------------------------------------------------------------
do $$
declare r record;
begin
  for r in select c.relname, c.relkind from pg_class c join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'public' and c.relname like 'nadgol\_%' and c.relkind in ('r','v') loop
    execute format('revoke all on public.%I from anon, public', r.relname);
    execute format('grant select, insert, update, delete on public.%I to authenticated', r.relname);
    execute format('grant all on public.%I to service_role', r.relname);
  end loop;
  for r in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname like 'nadgol\_%' loop
    execute format('revoke all on function %s from anon, public', r.sig);
    execute format('grant execute on function %s to authenticated, service_role', r.sig);
  end loop;
end $$;

-- O convite precisa ser lido antes do login (tela de cadastro)
grant execute on function public.nadgol_ver_convite(uuid) to anon;

-- Chat em tempo real
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.nadgol_mensagens, public.nadgol_notificacoes;
  end if;
end $$;

commit;
