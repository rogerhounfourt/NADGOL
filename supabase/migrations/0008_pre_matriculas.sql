-- 0008: Tabela de pré-matrículas (formulário público)
-- Captação pública sem login; admin aprova/rejeita depois

create table if not exists public.nadgol_pre_matriculas (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.nadgol_escolas(id) on delete cascade,

  -- Dados do atleta
  nome_atleta text not null check (char_length(nome_atleta) between 2 and 120),
  data_nascimento date not null,
  sexo text not null check (sexo in ('M','F')),
  posicao text,
  pe_dominante text check (pe_dominante in ('Direito','Esquerdo','Ambos')),

  -- Dados do responsável
  nome_responsavel text not null check (char_length(nome_responsavel) between 2 and 120),
  telefone_responsavel text not null,
  email_responsavel text,
  parentesco text, -- pai, mãe, avó, tio, etc.

  -- Endereço resumido
  bairro text,
  cidade text,

  -- Extras
  como_conheceu text, -- indicação, instagram, evento, etc.
  observacoes text,

  -- Controle
  status text not null default 'pendente' check (status in ('pendente','aprovada','rejeitada')),
  motivo_rejeicao text,
  aprovada_por uuid references public.nadgol_perfis(id),
  aprovada_em timestamptz,

  criado_em timestamptz not null default now()
);

-- RLS: anon pode inserir (formulário público), autenticado pode ler/atualizar da sua escola
alter table public.nadgol_pre_matriculas enable row level security;

-- Qualquer um pode inserir (formulário público)
create policy "pre_matriculas_insert_public"
  on public.nadgol_pre_matriculas for insert
  with check (true);

-- Membros da escola podem ver as pré-matrículas da sua escola
create policy "pre_matriculas_select_escola"
  on public.nadgol_pre_matriculas for select
  using (
    exists (
      select 1 from public.nadgol_membros m
      where m.escola_id = nadgol_pre_matriculas.escola_id
        and m.usuario_id = auth.uid()
        and m.papel in ('admin','treinador')
    )
  );

-- Admin da escola pode atualizar (aprovar/rejeitar)
create policy "pre_matriculas_update_admin"
  on public.nadgol_pre_matriculas for update
  using (
    exists (
      select 1 from public.nadgol_membros m
      where m.escola_id = nadgol_pre_matriculas.escola_id
        and m.usuario_id = auth.uid()
        and m.papel = 'admin'
    )
  );

-- Índice para listagem por escola + status
create index if not exists idx_pre_matriculas_escola_status
  on public.nadgol_pre_matriculas(escola_id, status);
