# Nadgol Academy

Plataforma SaaS de gestão de escolinhas de futebol (multi-escola).
React 19 + Vite + Tailwind 4 no front; Supabase (Postgres, Auth, Realtime) no back.

## Rodar

```bash
pnpm install
cp .env.example .env.local   # preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
pnpm dev
```

Sem `.env.local` o app abre em **modo demonstração** (dados de exemplo, sem login real).

## Banco (Supabase self-hosted, compartilhado)

Todos os objetos começam com `nadgol_`. Nada de outros projetos é alterado.

1. SQL Editor → rode `supabase/migrations/0001_nadgol_schema.sql`.
2. Authentication → Users → crie seu usuário.
3. Edite o e-mail em `supabase/bootstrap_primeiro_acesso.sql` e rode.

## Perfis

| Papel no banco | Tela | Vê |
|---|---|---|
| `admin` | Administrador | tudo da própria escola |
| `treinador` | Treinador | atletas, turmas, presença, desempenho (sem financeiro) |
| `responsavel` | Responsável | só os atletas vinculados a ele, e as mensalidades deles |
| `atleta` | Atleta | só o próprio perfil |

As regras ficam no banco (RLS). O menu só esconde o que o perfil não usa.
Novos usuários entram por convite: `nadgol_convites` gera um token e o link é `/convite/<token>`.

## Estrutura

- `client/src/lib/queries.ts` — toda leitura/escrita no banco
- `client/src/contexts/AppContext.tsx` — sessão, escola ativa, navegação
- `client/src/lib/permissions.ts` — telas por perfil e telas já conectadas
- `supabase/migrations/` — schema, RLS e funções

## Deploy

Vercel: importar o repositório e definir as duas variáveis `VITE_SUPABASE_*`. O `vercel.json` já traz build, rotas e cabeçalhos de segurança.
