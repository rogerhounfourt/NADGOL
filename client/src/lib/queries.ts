// Camada de dados do NADGOL: toda leitura/escrita no banco passa por aqui.
// As telas recebem os mesmos formatos de antes (Athlete, TrainingClass...),
// então o layout não muda. No modo demonstração, devolve os dados de exemplo.
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { supabase } from './supabase';
import { enviarFoto, enviarEscudo, removerFotoAntiga } from './foto';
import { ATHLETES, CLASSES, FINANCIAL, getCategory, NOTIFICATIONS, CHAT_MESSAGES, COMPETITIONS, type Competition, type Notification, type ChatMessage, type UserRole, type Athlete, type TrainingClass, type FinancialRecord } from './data';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const hojeISO = () => new Date().toLocaleDateString('en-CA'); // AAAA-MM-DD no fuso local

function falha(error: { message: string } | null): asserts error is null {
  if (error) throw new Error(error.message);
}
const avisoDemo = () => toast.info('Modo demonstração: conecte o banco para salvar de verdade.');
const erroPadrao = (e: Error) => toast.error(e.message.includes('row-level security') || e.message.includes('permiss') ? 'Você não tem permissão para isso.' : 'Não foi possível salvar. Tente novamente.');

function useEscola() {
  const { currentUser, demo } = useApp();
  return { escolaId: currentUser?.escolaId ?? '', demo, userId: currentUser?.id ?? '' };
}

// ----------------------------------------------------------------------------
// Atletas
// ----------------------------------------------------------------------------
function paraAthlete(r: any): Athlete {
  return {
    id: r.id, name: r.nome, photo: r.foto_url ?? undefined,
    birthDate: r.data_nascimento, birthYear: Number(String(r.data_nascimento).slice(0, 4)),
    position: r.posicao ?? '—', dominantFoot: r.pe_dominante ?? 'Direito',
    height: Number(r.altura_cm ?? 0), weight: Number(r.peso_kg ?? 0),
    phone: r.telefone ?? '—', unit: r.unidade_nome ?? '—', unitId: r.unidade_id ?? undefined,
    observations: r.observacoes ?? undefined, goal: r.objetivo ?? undefined, dream: r.sonho ?? undefined,
    favoriteClub: r.clube_favorito ?? undefined, classId: r.turma_id ?? '',
    status: ({ ativo: 'active', inativo: 'inactive', trancado: 'locked', em_clube: 'at_club' } as const)[r.status as string] ?? 'inactive',
    clubeAtualNome: r.clube_atual_nome ?? undefined, clubeAtualEscudo: r.clube_atual_escudo ?? undefined,
    goals: r.gols ?? 0, assists: r.assistencias ?? 0, attendance: r.presenca_pct ?? 0,
    monthlyFee: r.valor_mensalidade != null ? Number(r.valor_mensalidade) : undefined, dueDay: r.dia_vencimento ?? undefined,
  };
}

export function useAthletes() {
  const { escolaId, demo } = useEscola();
  return useQuery({
    queryKey: ['atletas', escolaId],
    enabled: demo || !!escolaId,
    queryFn: async (): Promise<Athlete[]> => {
      if (demo) return ATHLETES;
      const { data, error } = await supabase.from('nadgol_atletas_resumo').select('*').eq('escola_id', escolaId).order('nome');
      falha(error);
      const lista = (data ?? []).map(paraAthlete);
      // Posição no ranking: gols valem 3, assistências 2
      const ordem = [...lista].sort((a, b) => (b.goals! * 3 + b.assists! * 2) - (a.goals! * 3 + a.assists! * 2));
      ordem.forEach((a, i) => { a.ranking = i + 1; });
      return lista;
    },
  });
}

export interface NovoAtleta {
  nome: string; dataNascimento: string; posicao?: string; peDominante?: string;
  alturaCm?: number; pesoKg?: number; telefone?: string; unidadeId?: string; turmaId?: string;
  sonho?: string; clubeFavorito?: string; valorMensalidade?: number; diaVencimento?: number;
  objetivo?: string; observacoes?: string;
  /** foto já recortada (Blob JPEG) */
  foto?: Blob;
}

export function useCreateAthlete() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: NovoAtleta) => {
      if (demo) { avisoDemo(); return; }
      const { data, error } = await supabase.from('nadgol_atletas').insert({
        escola_id: escolaId, nome: a.nome.trim(), data_nascimento: a.dataNascimento,
        posicao: a.posicao || null, pe_dominante: a.peDominante || null,
        altura_cm: a.alturaCm || null, peso_kg: a.pesoKg || null, telefone: a.telefone || null,
        unidade_id: a.unidadeId || null, sonho: a.sonho || null, clube_favorito: a.clubeFavorito || null,
        valor_mensalidade: a.valorMensalidade ?? null, dia_vencimento: a.diaVencimento ?? null,
        objetivo: a.objetivo || null, observacoes: a.observacoes || null,
      }).select('id').single();
      falha(error);
      if (a.turmaId) {
        const r = await supabase.from('nadgol_turmas_atletas').insert({ turma_id: a.turmaId, atleta_id: data!.id, escola_id: escolaId });
        falha(r.error);
      }
      if (a.foto) {
        // O atleta já está salvo; se só a foto falhar, avisa sem perder o cadastro.
        try {
          const url = await enviarFoto(escolaId, data!.id, a.foto);
          const r = await supabase.rpc('nadgol_atualizar_atleta', { p_atleta: data!.id, p: { foto_url: url } });
          falha(r.error);
        } catch { toast.warning('Atleta cadastrado, mas a foto não foi enviada. Abra o cadastro e tente de novo.'); }
      }
    },
    onSuccess: () => { if (!demo) toast.success('Atleta cadastrado.'); qc.invalidateQueries({ queryKey: ['atletas'] }); qc.invalidateQueries({ queryKey: ['turmas'] }); },
    onError: erroPadrao,
  });
}

export interface EdicaoAtleta {
  id: string;
  nome?: string; dataNascimento?: string; posicao?: string; peDominante?: string;
  alturaCm?: number | null; pesoKg?: number | null; telefone?: string; clubeFavorito?: string;
  sonho?: string; objetivo?: string; observacoes?: string;
  /** só equipe */ status?: 'ativo' | 'inativo' | 'trancado' | 'em_clube'; unidadeId?: string;
  clubeAtualNome?: string | null; clubeAtualEscudo?: string | null;
  /** só administrador */ valorMensalidade?: number | null; diaVencimento?: number | null;
  /** só equipe: trocar de turma */ turmaId?: string; turmaAnteriorId?: string;
  /** undefined = não mexeu · Blob = nova foto · null = remover */ foto?: Blob | null; fotoAtual?: string;
}

const MAPA_CAMPOS: Record<string, string> = {
  nome: 'nome', dataNascimento: 'data_nascimento', posicao: 'posicao', peDominante: 'pe_dominante',
  alturaCm: 'altura_cm', pesoKg: 'peso_kg', telefone: 'telefone', clubeFavorito: 'clube_favorito',
  sonho: 'sonho', objetivo: 'objetivo', observacoes: 'observacoes', status: 'status', unidadeId: 'unidade_id',
  valorMensalidade: 'valor_mensalidade', diaVencimento: 'dia_vencimento',
  clubeAtualNome: 'clube_atual_nome', clubeAtualEscudo: 'clube_atual_escudo',
};

/** Edita o cadastro: aluno, responsável (dados pessoais e foto) e equipe/administrador. A regra de quem pode o quê fica no banco. */
// Soft-delete: desativa o atleta (status -> inativo)
export function useDeactivateAthlete() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (demo) { avisoDemo(); return; }
      const { error } = await supabase.rpc('nadgol_atualizar_atleta', { p_atleta: id, p: { status: 'inativo' } });
      falha(error);
    },
    onSuccess: () => { toast.success('Atleta desativado.'); qc.invalidateQueries({ queryKey: ['atletas'] }); qc.invalidateQueries({ queryKey: ['ranking'] }); },
    onError: erroPadrao,
  });
}

export function useUpdateAthlete() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (e: EdicaoAtleta) => {
      if (demo) { avisoDemo(); return; }
      const p: Record<string, unknown> = {};
      for (const [k, col] of Object.entries(MAPA_CAMPOS)) {
        const v = (e as unknown as Record<string, unknown>)[k];
        if (v !== undefined) p[col] = v;
      }
      let novaFoto: string | null | undefined;
      if (e.foto instanceof Blob) { novaFoto = await enviarFoto(escolaId, e.id, e.foto); p.foto_url = novaFoto; }
      else if (e.foto === null) { novaFoto = null; p.foto_url = null; }

      const r = await supabase.rpc('nadgol_atualizar_atleta', { p_atleta: e.id, p });
      falha(r.error);
      if (novaFoto !== undefined) void removerFotoAntiga(e.fotoAtual);

      if (e.turmaId !== undefined && e.turmaId !== (e.turmaAnteriorId ?? '')) {
        const del = await supabase.from('nadgol_turmas_atletas').delete().eq('atleta_id', e.id);
        falha(del.error);
        if (e.turmaId) {
          const ins = await supabase.from('nadgol_turmas_atletas').insert({ turma_id: e.turmaId, atleta_id: e.id, escola_id: escolaId });
          falha(ins.error);
        }
      }
    },
    onSuccess: () => {
      if (!demo) toast.success('Cadastro atualizado.');
      for (const k of ['atletas', 'turmas', 'ranking', 'metricas', 'xp-ranking']) qc.invalidateQueries({ queryKey: [k] });
    },
    onError: erroPadrao,
  });
}

// ----------------------------------------------------------------------------
// Unidades e turmas
// ----------------------------------------------------------------------------
export function useUnits() {
  const { escolaId, demo } = useEscola();
  return useQuery({
    queryKey: ['unidades', escolaId],
    enabled: !demo && !!escolaId,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<{ id: string; nome: string }[]> => {
      const { data, error } = await supabase.from('nadgol_unidades').select('id, nome').eq('escola_id', escolaId).eq('ativo', true).order('nome');
      falha(error);
      return data ?? [];
    },
  });
}

export function useClasses() {
  const { escolaId, demo } = useEscola();
  return useQuery({
    queryKey: ['turmas', escolaId],
    enabled: demo || !!escolaId,
    queryFn: async (): Promise<TrainingClass[]> => {
      if (demo) return CLASSES;
      const { data, error } = await supabase.from('nadgol_turmas')
        .select('id, nome, categoria, dia_semana, horario, treinador_nome, max_atletas, unidade:nadgol_unidades(nome), atletas:nadgol_turmas_atletas(atleta_id)')
        .eq('escola_id', escolaId).eq('ativo', true).order('nome');
      falha(error);
      return (data ?? []).map((t: any) => ({
        id: t.id, name: t.nome, category: t.categoria ?? '—', day: t.dia_semana ?? '—',
        time: t.horario ? String(t.horario).slice(0, 5) : '—', coach: t.treinador_nome ?? '—',
        unit: (Array.isArray(t.unidade) ? t.unidade[0]?.nome : t.unidade?.nome) ?? '—',
        athletes: (t.atletas ?? []).map((x: any) => x.atleta_id), maxAthletes: t.max_atletas,
      }));
    },
  });
}

export interface NovaTurma { nome: string; categoria?: string; diaSemana?: string; horario?: string; treinadorNome?: string; maxAtletas?: number; unidadeNome?: string }

async function resolverUnidade(escolaId: string, nome?: string): Promise<string | null> {
  const n = nome?.trim();
  if (!n) return null;
  const ex = await supabase.from('nadgol_unidades').select('id').eq('escola_id', escolaId).ilike('nome', n).maybeSingle();
  falha(ex.error);
  if (ex.data) return ex.data.id;
  const nova = await supabase.from('nadgol_unidades').insert({ escola_id: escolaId, nome: n }).select('id').single();
  falha(nova.error);
  return nova.data!.id;
}

export function useCreateClass() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (t: NovaTurma) => {
      if (demo) { avisoDemo(); return; }
      const unidadeId = await resolverUnidade(escolaId, t.unidadeNome);
      const { error } = await supabase.from('nadgol_turmas').insert({
        escola_id: escolaId, nome: t.nome.trim(), categoria: t.categoria || null, dia_semana: t.diaSemana || null,
        horario: t.horario || null, treinador_nome: t.treinadorNome || null, max_atletas: t.maxAtletas || 20, unidade_id: unidadeId,
      });
      falha(error);
    },
    onSuccess: () => { if (!demo) toast.success('Turma criada.'); qc.invalidateQueries({ queryKey: ['turmas'] }); qc.invalidateQueries({ queryKey: ['unidades'] }); },
    onError: erroPadrao,
  });
}

/** Edita os dados da turma (administrador). */
export function useUpdateClass() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (t: NovaTurma & { id: string }) => {
      if (demo) { avisoDemo(); return; }
      const unidadeId = await resolverUnidade(escolaId, t.unidadeNome);
      const { error } = await supabase.from('nadgol_turmas').update({
        nome: t.nome.trim(), categoria: t.categoria || null, dia_semana: t.diaSemana || null,
        horario: t.horario || null, treinador_nome: t.treinadorNome || null, max_atletas: t.maxAtletas || 20, unidade_id: unidadeId,
      }).eq('id', t.id).eq('escola_id', escolaId);
      falha(error);
    },
    onSuccess: () => { if (!demo) toast.success('Turma atualizada.'); qc.invalidateQueries({ queryKey: ['turmas'] }); qc.invalidateQueries({ queryKey: ['unidades'] }); },
    onError: erroPadrao,
  });
}

/** Arquiva a turma: some da lista, mas o histórico de presença continua no banco. */
export function useArchiveClass() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (demo) { avisoDemo(); return; }
      const { error } = await supabase.from('nadgol_turmas').update({ ativo: false }).eq('id', id).eq('escola_id', escolaId);
      falha(error);
    },
    onSuccess: () => { if (!demo) toast.success('Turma arquivada.'); qc.invalidateQueries({ queryKey: ['turmas'] }); qc.invalidateQueries({ queryKey: ['atletas'] }); },
    onError: erroPadrao,
  });
}

/** Coloca ou tira um atleta da turma (administrador e treinador). */
export function useSetClassMember() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { turmaId: string; atletaId: string; entrar: boolean }) => {
      if (demo) { avisoDemo(); return; }
      if (v.entrar) {
        const { error } = await supabase.from('nadgol_turmas_atletas').insert({ turma_id: v.turmaId, atleta_id: v.atletaId, escola_id: escolaId });
        falha(error);
      } else {
        const { error } = await supabase.from('nadgol_turmas_atletas').delete().eq('turma_id', v.turmaId).eq('atleta_id', v.atletaId);
        falha(error);
      }
    },
    onSuccess: (_d, v) => { if (!demo) toast.success(v.entrar ? 'Atleta adicionado à turma.' : 'Atleta removido da turma.'); qc.invalidateQueries({ queryKey: ['turmas'] }); qc.invalidateQueries({ queryKey: ['atletas'] }); },
    onError: erroPadrao,
  });
}

// ----------------------------------------------------------------------------
// Presença
// ----------------------------------------------------------------------------
export type AttStatus = 'present' | 'absent' | 'late' | null;
export type AttPerf = 'highlight' | 'great' | 'evolving' | 'needs_work' | null;
export type AttMap = Record<string, { status: AttStatus; performance: AttPerf }>;

const ST_DB: Record<string, AttStatus> = { presente: 'present', ausente: 'absent', atrasado: 'late' };
const ST_UI: Record<string, string> = { present: 'presente', absent: 'ausente', late: 'atrasado' };
const PF_DB: Record<string, AttPerf> = { destaque: 'highlight', otimo: 'great', evoluindo: 'evolving', precisa_melhorar: 'needs_work' };
const PF_UI: Record<string, string> = { highlight: 'destaque', great: 'otimo', evolving: 'evoluindo', needs_work: 'precisa_melhorar' };

export function useAttendance(turmaId: string, data: string) {
  const { escolaId, demo } = useEscola();
  return useQuery({
    queryKey: ['presencas', escolaId, turmaId, data],
    enabled: !demo && !!escolaId && !!turmaId,
    queryFn: async (): Promise<AttMap> => {
      const r = await supabase.from('nadgol_presencas').select('atleta_id, status, desempenho').eq('turma_id', turmaId).eq('data', data);
      falha(r.error);
      const mapa: AttMap = {};
      for (const p of r.data ?? []) mapa[p.atleta_id] = { status: ST_DB[p.status] ?? null, performance: p.desempenho ? PF_DB[p.desempenho] ?? null : null };
      return mapa;
    },
  });
}

export function useSaveAttendance() {
  const { demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { turmaId: string; data: string; registros: AttMap }) => {
      if (demo) { avisoDemo(); return 0; }
      const itens = Object.entries(v.registros)
        .filter(([, r]) => r.status)
        .map(([atleta_id, r]) => ({ atleta_id, status: ST_UI[r.status!], desempenho: r.performance ? PF_UI[r.performance] : '' }));
      if (!itens.length) throw new Error('vazio');
      const { data, error } = await supabase.rpc('nadgol_salvar_presencas', { p_turma: v.turmaId, p_data: v.data, p_itens: itens });
      falha(error);
      return data as number;
    },
    onSuccess: (n) => { if (!demo) toast.success(`Presença salva (${n} atleta${n === 1 ? '' : 's'}).`); qc.invalidateQueries({ queryKey: ['presencas'] }); qc.invalidateQueries({ queryKey: ['atletas'] }); },
    onError: (e: Error) => e.message === 'vazio' ? toast.warning('Marque pelo menos um atleta antes de salvar.') : erroPadrao(e),
  });
}

// ----------------------------------------------------------------------------
// Financeiro (mensalidades)
// ----------------------------------------------------------------------------
/** "2026-11" → primeiro dia do mês */
export const competenciaAtual = () => hojeISO().slice(0, 7);
export const nomeCompetencia = (c: string) => `${MESES[Number(c.slice(5, 7)) - 1]} ${c.slice(0, 4)}`;

export function useFinancial(competencia: string) {
  const { escolaId, demo } = useEscola();
  return useQuery({
    queryKey: ['mensalidades', escolaId, competencia],
    enabled: demo || !!escolaId,
    queryFn: async (): Promise<FinancialRecord[]> => {
      if (demo) return FINANCIAL;
      const { data, error } = await supabase.from('nadgol_mensalidades')
        .select('id, atleta_id, competencia, valor, vencimento, status, pago_em, observacoes')
        .eq('escola_id', escolaId).eq('competencia', `${competencia}-01`).neq('status', 'cancelado');
      falha(error);
      const hoje = hojeISO();
      return (data ?? []).map((m: any) => ({
        id: m.id, athleteId: m.atleta_id,
        month: MESES[Number(String(m.competencia).slice(5, 7)) - 1], year: Number(String(m.competencia).slice(0, 4)),
        amount: Number(m.valor),
        status: m.status === 'pago' ? 'paid' : m.vencimento < hoje ? 'overdue' : 'pending',
        paidDate: m.pago_em ?? undefined, observations: m.observacoes ?? undefined,
      }));
    },
  });
}

export function useGenerateFees() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (competencia: string) => {
      if (demo) { avisoDemo(); return 0; }
      const { data, error } = await supabase.rpc('nadgol_gerar_mensalidades', { p_escola: escolaId, p_competencia: `${competencia}-01` });
      falha(error);
      return data as number;
    },
    onSuccess: (n) => {
      if (demo) return;
      if (n) toast.success(`${n} mensalidade${n === 1 ? '' : 's'} gerada${n === 1 ? '' : 's'}.`);
      else toast.info('Nada a gerar: confira se os atletas têm valor de mensalidade definido.');
      qc.invalidateQueries({ queryKey: ['mensalidades'] });
    },
    onError: erroPadrao,
  });
}

export function useSetFeePaid() {
  const { demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id: string; pago: boolean }) => {
      if (demo) { avisoDemo(); return; }
      const { error } = await supabase.from('nadgol_mensalidades')
        .update(v.pago ? { status: 'pago', pago_em: hojeISO() } : { status: 'pendente', pago_em: null }).eq('id', v.id);
      falha(error);
    },
    onSuccess: (_d, v) => { if (!demo) toast.success(v.pago ? 'Pagamento registrado.' : 'Pagamento desfeito.'); qc.invalidateQueries({ queryKey: ['mensalidades'] }); },
    onError: erroPadrao,
  });
}

// ----------------------------------------------------------------------------
// Dashboard (indicadores resumidos)
// ----------------------------------------------------------------------------
export interface DashboardDados {
  presentes: number; ausentes: number; atrasados: number;
  competicoes: number; // competições futuras
  evolucao: { month: string; atletas: number; presenca: number }[];
}
const MES_CURTO = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function useDashboard() {
  const { escolaId, demo } = useEscola();
  return useQuery({
    queryKey: ['dashboard', escolaId],
    enabled: demo || !!escolaId,
    queryFn: async (): Promise<DashboardDados> => {
      if (demo) {
        return { presentes: 42, ausentes: 3, atrasados: 5, competicoes: 3, evolucao: [
          { month: 'Jan', atletas: 8, presenca: 82 }, { month: 'Fev', atletas: 9, presenca: 85 },
          { month: 'Mar', atletas: 10, presenca: 88 }, { month: 'Abr', atletas: 11, presenca: 86 },
          { month: 'Mai', atletas: 12, presenca: 90 } ] };
      }
      const hoje = hojeISO();
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 4);
      const inicio = d.toLocaleDateString('en-CA');
      const [pres, comp, atl] = await Promise.all([
        supabase.from('nadgol_presencas').select('data, status').eq('escola_id', escolaId).gte('data', inicio),
        supabase.from('nadgol_competicoes').select('id', { count: 'exact', head: true }).eq('escola_id', escolaId).gte('data', hoje),
        supabase.from('nadgol_atletas').select('criado_em').eq('escola_id', escolaId).eq('status', 'ativo'),
      ]);
      falha(pres.error); falha(comp.error); falha(atl.error);
      const linhas = pres.data ?? [];
      const doDia = linhas.filter((p: any) => p.data === hoje);
      const conta = (l: any[], s: string) => l.filter(p => p.status === s).length;
      const evolucao = Array.from({ length: 5 }, (_, i) => {
        const ref = new Date(); ref.setDate(1); ref.setMonth(ref.getMonth() - (4 - i));
        const chave = ref.toLocaleDateString('en-CA').slice(0, 7);
        const mes = linhas.filter((p: any) => String(p.data).startsWith(chave));
        const fim = new Date(ref.getFullYear(), ref.getMonth() + 1, 1).toISOString();
        return {
          month: MES_CURTO[ref.getMonth()],
          atletas: (atl.data ?? []).filter((a: any) => a.criado_em < fim).length,
          presenca: mes.length ? Math.round(((conta(mes, 'presente') + conta(mes, 'atrasado')) / mes.length) * 100) : 0,
        };
      });
      return { presentes: conta(doDia, 'presente'), ausentes: conta(doDia, 'ausente'), atrasados: conta(doDia, 'atrasado'), competicoes: comp.count ?? 0, evolucao };
    },
  });
}

// ----------------------------------------------------------------------------
// Acessos: escolinhas, convites e membros
// ----------------------------------------------------------------------------
export type Papel = 'admin' | 'treinador' | 'responsavel' | 'atleta';
export const PAPEL_NOME: Record<Papel, string> = { admin: 'Administrador', treinador: 'Treinador', responsavel: 'Responsável', atleta: 'Atleta' };

export interface EscolaRow { id: string; nome: string; slug: string; plano: string; status: string; criadoEm: string }
export interface ConviteRow { id: string; papel: Papel; nome: string | null; token: string; expiraEm: string; usadoEm: string | null; atletaNome: string | null }
export interface MembroRow { id: string; usuarioId: string; papel: Papel; ativo: boolean; nome: string; email: string }

export const linkConvite = (token: string) => `${window.location.origin}/convite/${token}`;

const slugify = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);

export function useAllSchools(enabled: boolean) {
  const { demo } = useEscola();
  return useQuery({
    queryKey: ['escolas-todas'],
    enabled: enabled && !demo,
    queryFn: async (): Promise<EscolaRow[]> => {
      const { data, error } = await supabase.from('nadgol_escolas').select('id, nome, slug, plano, status, criado_em').order('criado_em', { ascending: false });
      falha(error);
      return (data ?? []).map((e: any) => ({ id: e.id, nome: e.nome, slug: e.slug, plano: e.plano, status: e.status, criadoEm: e.criado_em }));
    },
  });
}

export function useCreateSchool() {
  const { demo, userId } = useEscola();
  const { recarregarEscolas } = useApp();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { nome: string }) => {
      if (demo) { avisoDemo(); return; }
      const slug = `${slugify(v.nome) || 'escola'}-${Math.random().toString(36).slice(2, 6)}`;
      const { data, error } = await supabase.from('nadgol_escolas')
        .insert({ nome: v.nome.trim(), slug, trial_ate: new Date(Date.now() + 14 * 864e5).toLocaleDateString('en-CA') })
        .select('id').single();
      falha(error);
      // O super admin entra como administrador para a escolinha aparecer no seletor
      const m = await supabase.from('nadgol_membros').insert({ escola_id: data!.id, usuario_id: userId, papel: 'admin' });
      falha(m.error);
    },
    onSuccess: async () => { await recarregarEscolas(); qc.invalidateQueries({ queryKey: ['escolas-todas'] }); toast.success('Escolinha criada.'); },
    onError: erroPadrao,
  });
}

export function useInvites() {
  const { escolaId, demo } = useEscola();
  return useQuery({
    queryKey: ['convites', escolaId],
    enabled: !demo && !!escolaId,
    queryFn: async (): Promise<ConviteRow[]> => {
      const { data, error } = await supabase.from('nadgol_convites')
        .select('id, papel, nome, token, expira_em, usado_em, atleta:nadgol_atletas(nome)')
        .eq('escola_id', escolaId).order('criado_em', { ascending: false }).limit(100);
      falha(error);
      return (data ?? []).map((c: any) => {
        const a = Array.isArray(c.atleta) ? c.atleta[0] : c.atleta;
        return { id: c.id, papel: c.papel, nome: c.nome, token: c.token, expiraEm: c.expira_em, usadoEm: c.usado_em, atletaNome: a?.nome ?? null };
      });
    },
  });
}

export function useCreateInvite() {
  const { escolaId, demo, userId } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { papel: Papel; nome?: string; atletaId?: string }): Promise<string | null> => {
      if (demo) { avisoDemo(); return null; }
      const { data, error } = await supabase.from('nadgol_convites')
        .insert({ escola_id: escolaId, papel: v.papel, nome: v.nome?.trim() || null, atleta_id: v.atletaId || null, criado_por: userId })
        .select('token').single();
      falha(error);
      return data!.token as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['convites'] }),
    onError: erroPadrao,
  });
}

export function useRevokeInvite() {
  const { demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (demo) { avisoDemo(); return; }
      const { error } = await supabase.from('nadgol_convites').delete().eq('id', id);
      falha(error);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['convites'] }); toast.success('Convite cancelado.'); },
    onError: erroPadrao,
  });
}

export function useMembers() {
  const { escolaId, demo } = useEscola();
  return useQuery({
    queryKey: ['membros', escolaId],
    enabled: !demo && !!escolaId,
    queryFn: async (): Promise<MembroRow[]> => {
      const { data, error } = await supabase.from('nadgol_membros')
        .select('id, usuario_id, papel, ativo, perfil:nadgol_perfis(nome, email)')
        .eq('escola_id', escolaId).order('criado_em');
      falha(error);
      return (data ?? []).map((m: any) => {
        const p = Array.isArray(m.perfil) ? m.perfil[0] : m.perfil;
        return { id: m.id, usuarioId: m.usuario_id, papel: m.papel, ativo: m.ativo, nome: p?.nome ?? '—', email: p?.email ?? '' };
      });
    },
  });
}

export function useSetMemberActive() {
  const { demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id: string; ativo: boolean }) => {
      if (demo) { avisoDemo(); return; }
      const { error } = await supabase.from('nadgol_membros').update({ ativo: v.ativo }).eq('id', v.id);
      falha(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['membros'] }),
    onError: erroPadrao,
  });
}

// ----------------------------------------------------------------------------
// Notificações
// ----------------------------------------------------------------------------
const TIPO_NOTIF: Record<string, Notification['type']> = { treino: 'training', jogo: 'game', pagamento: 'payment', aviso: 'announcement', avaliacao: 'evaluation', evento: 'event' };
const PAPEL_ROLE: Record<string, UserRole> = { admin: 'admin', treinador: 'coach', responsavel: 'parent', atleta: 'athlete' };

export function useNotifications() {
  const { escolaId, demo, userId } = useEscola();
  const qc = useQueryClient();

  // Novas notificações chegam em tempo real
  useEffect(() => {
    if (demo || !escolaId) return;
    const canal = supabase.channel(`notif-${escolaId}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nadgol_notificacoes', filter: `escola_id=eq.${escolaId}` },
        () => qc.invalidateQueries({ queryKey: ['notificacoes', escolaId] }))
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [demo, escolaId, qc]);

  return useQuery({
    queryKey: ['notificacoes', escolaId],
    enabled: demo || !!escolaId,
    queryFn: async (): Promise<Notification[]> => {
      if (demo) return NOTIFICATIONS;
      const [n, l] = await Promise.all([
        supabase.from('nadgol_notificacoes').select('id, titulo, mensagem, tipo, papeis, criado_em').eq('escola_id', escolaId).order('criado_em', { ascending: false }).limit(100),
        supabase.from('nadgol_notificacoes_lidas').select('notificacao_id').eq('usuario_id', userId),
      ]);
      falha(n.error); falha(l.error);
      const lidas = new Set((l.data ?? []).map((x: any) => x.notificacao_id));
      return (n.data ?? []).map((r: any) => ({
        id: r.id, title: r.titulo, message: r.mensagem, type: TIPO_NOTIF[r.tipo] ?? 'announcement',
        date: r.criado_em, read: lidas.has(r.id), targetRoles: (r.papeis ?? []).map((p: string) => PAPEL_ROLE[p]).filter(Boolean),
      }));
    },
  });
}

export function useMarkNotificationRead() {
  const { escolaId, demo, userId } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (demo) return;
      const { error } = await supabase.from('nadgol_notificacoes_lidas').upsert({ notificacao_id: id, usuario_id: userId }, { onConflict: 'notificacao_id,usuario_id', ignoreDuplicates: true });
      falha(error);
    },
    onMutate: async (id: string) => {
      qc.setQueryData<Notification[]>(['notificacoes', escolaId], old => old?.map(n => n.id === id ? { ...n, read: true } : n));
    },
    onError: () => qc.invalidateQueries({ queryKey: ['notificacoes', escolaId] }),
  });
}

export interface NovaNotificacao { titulo: string; mensagem: string; tipo: string; destino: string }
const DESTINOS: Record<string, string[]> = {
  todos: ['admin', 'treinador', 'responsavel', 'atleta'],
  equipe: ['admin', 'treinador'],
  responsaveis: ['admin', 'treinador', 'responsavel'],
  atletas: ['admin', 'treinador', 'atleta'],
};

export function useCreateNotification() {
  const { escolaId, demo, userId } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: NovaNotificacao) => {
      if (demo) { avisoDemo(); return; }
      const { error } = await supabase.from('nadgol_notificacoes').insert({
        escola_id: escolaId, titulo: v.titulo.trim(), mensagem: v.mensagem.trim(), tipo: v.tipo || 'aviso',
        papeis: DESTINOS[v.destino] ?? DESTINOS.todos, criado_por: userId,
      });
      falha(error);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notificacoes'] }); toast.success('Notificação enviada.'); },
    onError: erroPadrao,
  });
}

// ----------------------------------------------------------------------------
// Chat (tempo real)
// ----------------------------------------------------------------------------
const SALA = 'geral';

export function useChat() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  const chave = ['chat', escolaId, SALA];

  useEffect(() => {
    if (demo || !escolaId) return;
    const canal = supabase.channel(`chat-${escolaId}-${SALA}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nadgol_mensagens', filter: `escola_id=eq.${escolaId}` }, payload => {
        const m = paraMensagem(payload.new);
        if (m.roomId !== SALA) return;
        qc.setQueryData<ChatMessage[]>(chave, old => (old ?? []).some(x => x.id === m.id) ? old : [...(old ?? []), m]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'nadgol_mensagens', filter: `escola_id=eq.${escolaId}` }, payload => {
        const id = (payload.old as any)?.id;
        if (id) qc.setQueryData<ChatMessage[]>(chave, old => old?.filter(x => x.id !== id));
      })
      .subscribe();
    return () => { supabase.removeChannel(canal); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, escolaId, qc]);

  return useQuery({
    queryKey: chave,
    enabled: demo || !!escolaId,
    staleTime: Infinity,
    queryFn: async (): Promise<ChatMessage[]> => {
      if (demo) return CHAT_MESSAGES;
      const { data, error } = await supabase.from('nadgol_mensagens').select('*').eq('escola_id', escolaId).eq('sala', SALA).order('criado_em', { ascending: false }).limit(100);
      falha(error);
      return (data ?? []).reverse().map(paraMensagem);
    },
  });
}

function paraMensagem(r: any): ChatMessage {
  return { id: r.id, senderId: r.autor_id, senderName: r.autor_nome || 'Usuário', senderRole: PAPEL_ROLE[r.autor_papel] ?? 'parent', message: r.mensagem, timestamp: r.criado_em, roomId: r.sala };
}

export function useSendMessage() {
  const { escolaId, demo, userId } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (texto: string): Promise<ChatMessage | null> => {
      if (demo) return null;
      // Nome e papel do autor são definidos pelo servidor (não dá para falsificar)
      const { data, error } = await supabase.from('nadgol_mensagens').insert({ escola_id: escolaId, sala: SALA, autor_id: userId, mensagem: texto.trim() }).select('*').single();
      falha(error);
      return paraMensagem(data);
    },
    onSuccess: m => {
      if (m) qc.setQueryData<ChatMessage[]>(['chat', escolaId, SALA], old => (old ?? []).some(x => x.id === m.id) ? old : [...(old ?? []), m]);
    },
    onError: () => toast.error('Não foi possível enviar a mensagem.'),
  });
}

// ----------------------------------------------------------------------------
// Ranking e Competições
// ----------------------------------------------------------------------------
/** Ranking da escolinha inteira (a função do banco mostra todos, mesmo para responsável/atleta) */
export function useRanking() {
  const { escolaId, demo } = useEscola();
  return useQuery({
    queryKey: ['ranking', escolaId],
    enabled: demo || !!escolaId,
    queryFn: async (): Promise<Athlete[]> => {
      if (demo) return [...ATHLETES].filter(a => a.status === 'active').sort((a, b) => (a.ranking || 99) - (b.ranking || 99));
      const { data, error } = await supabase.rpc('nadgol_ranking', { p_escola: escolaId });
      falha(error);
      return (data ?? []).map((r: any, i: number): Athlete => ({
        id: r.atleta_id, name: r.nome, photo: r.foto_url ?? undefined,
        birthDate: r.data_nascimento, birthYear: Number(String(r.data_nascimento).slice(0, 4)),
        position: r.posicao ?? '—', dominantFoot: 'Direito', height: 0, weight: 0, phone: '', unit: '', classId: '',
        status: 'active', ranking: i + 1, goals: Number(r.gols), assists: Number(r.assistencias), attendance: Number(r.presenca_pct ?? 0),
      }));
    },
  });
}

export interface CompetitionRow extends Competition { local?: string }

export function useCompetitions() {
  const { escolaId, demo } = useEscola();
  return useQuery({
    queryKey: ['competicoes', escolaId],
    enabled: demo || !!escolaId,
    queryFn: async (): Promise<CompetitionRow[]> => {
      if (demo) return COMPETITIONS;
      const { data, error } = await supabase.from('nadgol_competicoes')
        .select('id, nome, data, local, resultado, atletas:nadgol_competicoes_atletas(atleta_id)')
        .eq('escola_id', escolaId).order('data', { ascending: false });
      falha(error);
      return (data ?? []).map((c: any) => ({
        id: c.id, name: c.nome, date: c.data, result: c.resultado ?? undefined, local: c.local ?? undefined,
        athletes: (c.atletas ?? []).map((a: any) => a.atleta_id),
      }));
    },
  });
}

export function useCreateCompetition() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { nome: string; data: string; local?: string; resultado?: string; convocarTodos: boolean }) => {
      if (demo) { avisoDemo(); return; }
      const { data, error } = await supabase.from('nadgol_competicoes')
        .insert({ escola_id: escolaId, nome: v.nome.trim(), data: v.data, local: v.local?.trim() || null, resultado: v.resultado?.trim() || null })
        .select('id').single();
      falha(error);
      if (v.convocarTodos) {
        const { data: ativos, error: e2 } = await supabase.from('nadgol_atletas').select('id').eq('escola_id', escolaId).eq('status', 'ativo');
        falha(e2);
        if (ativos?.length) {
          const { error: e3 } = await supabase.from('nadgol_competicoes_atletas').insert(ativos.map((a: any) => ({ competicao_id: data!.id, atleta_id: a.id, escola_id: escolaId })));
          falha(e3);
        }
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['competicoes'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('Competição criada.'); },
    onError: erroPadrao,
  });
}

export function useEditCompetition() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id: string; nome: string; data: string; local?: string; resultado?: string }) => {
      if (demo) { avisoDemo(); return; }
      const { error } = await supabase.from('nadgol_competicoes')
        .update({ nome: v.nome.trim(), data: v.data, local: v.local?.trim() || null, resultado: v.resultado?.trim() || null })
        .eq('id', v.id).eq('escola_id', escolaId);
      falha(error);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['competicoes'] }); toast.success('Competição atualizada.'); },
    onError: erroPadrao,
  });
}

export function useDeleteCompetition() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (demo) { avisoDemo(); return; }
      const { error } = await supabase.from('nadgol_competicoes').delete().eq('id', id).eq('escola_id', escolaId);
      falha(error);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['competicoes'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('Competição excluída.'); },
    onError: erroPadrao,
  });
}

export interface InscricaoAtleta { atleta_id: string; numero_camisa: number | null }

export function useCompetitionAthletes(competicaoId: string | null) {
  const { escolaId, demo } = useEscola();
  return useQuery({
    queryKey: ['competicao-atletas', competicaoId],
    enabled: !demo && !!competicaoId && !!escolaId,
    queryFn: async (): Promise<InscricaoAtleta[]> => {
      const { data, error } = await supabase.from('nadgol_competicoes_atletas')
        .select('atleta_id, numero_camisa')
        .eq('competicao_id', competicaoId!).eq('escola_id', escolaId);
      falha(error);
      return (data ?? []).map((r: any) => ({ atleta_id: r.atleta_id, numero_camisa: r.numero_camisa ?? null }));
    },
  });
}

export function useEnrollAthlete() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { competicaoId: string; atletaId: string; numeroCamisa?: number }) => {
      if (demo) { avisoDemo(); return; }
      const { error } = await supabase.from('nadgol_competicoes_atletas')
        .upsert({ competicao_id: v.competicaoId, atleta_id: v.atletaId, escola_id: escolaId, numero_camisa: v.numeroCamisa ?? null }, { onConflict: 'competicao_id,atleta_id' });
      falha(error);
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['competicao-atletas', v.competicaoId] }); qc.invalidateQueries({ queryKey: ['competicoes'] }); },
    onError: erroPadrao,
  });
}

export function useRemoveEnrollment() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { competicaoId: string; atletaId: string }) => {
      if (demo) { avisoDemo(); return; }
      const { error } = await supabase.from('nadgol_competicoes_atletas')
        .delete().eq('competicao_id', v.competicaoId).eq('atleta_id', v.atletaId).eq('escola_id', escolaId);
      falha(error);
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['competicao-atletas', v.competicaoId] }); qc.invalidateQueries({ queryKey: ['competicoes'] }); },
    onError: erroPadrao,
  });
}

export function useUpdateShirtNumber() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { competicaoId: string; atletaId: string; numero: number | null }) => {
      if (demo) { avisoDemo(); return; }
      const { error } = await supabase.from('nadgol_competicoes_atletas')
        .update({ numero_camisa: v.numero })
        .eq('competicao_id', v.competicaoId).eq('atleta_id', v.atletaId).eq('escola_id', escolaId);
      falha(error);
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['competicao-atletas', v.competicaoId] }); },
    onError: erroPadrao,
  });
}

// ----------------------------------------------------------------------------
// Jogos (partidas) e estatísticas por atleta
// ----------------------------------------------------------------------------
export interface PartidaRow { id: string; adversario: string; data: string; local?: string; competicao?: string; competicaoId?: string; placarPro: number | null; placarContra: number | null; gols: number }
export interface StatsAtleta { gols: number; assistencias: number; minutos: number; nota: number | null }

export function useMatches() {
  const { escolaId, demo } = useEscola();
  return useQuery({
    queryKey: ['partidas', escolaId],
    enabled: !demo && !!escolaId,
    queryFn: async (): Promise<PartidaRow[]> => {
      const { data, error } = await supabase.from('nadgol_partidas')
        .select('id, adversario, data, local, placar_pro, placar_contra, competicao_id, competicao:nadgol_competicoes(nome), stats:nadgol_partidas_atletas(gols)')
        .eq('escola_id', escolaId).order('data', { ascending: false }).limit(30);
      falha(error);
      return (data ?? []).map((p: any) => {
        const c = Array.isArray(p.competicao) ? p.competicao[0] : p.competicao;
        return {
          id: p.id, adversario: p.adversario, data: p.data, local: p.local ?? undefined, competicao: c?.nome, competicaoId: p.competicao_id ?? undefined,
          placarPro: p.placar_pro, placarContra: p.placar_contra, gols: (p.stats ?? []).reduce((t: number, s: any) => t + (s.gols ?? 0), 0),
        };
      });
    },
  });
}

const invalidaDesempenho = (qc: ReturnType<typeof useQueryClient>) => {
  for (const k of ['partidas', 'atletas', 'ranking', 'dashboard']) qc.invalidateQueries({ queryKey: [k] });
};

export function useCreateMatch() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { adversario: string; data: string; local?: string; competicaoId?: string; placarPro?: string; placarContra?: string }) => {
      if (demo) { avisoDemo(); return; }
      const n = (x?: string) => (x === undefined || x === '' ? null : Math.max(0, Math.min(99, Math.round(Number(x)))));
      const { error } = await supabase.from('nadgol_partidas').insert({
        escola_id: escolaId, adversario: v.adversario.trim(), data: v.data, local: v.local?.trim() || null,
        competicao_id: v.competicaoId || null, placar_pro: n(v.placarPro), placar_contra: n(v.placarContra),
      });
      falha(error);
    },
    onSuccess: () => { invalidaDesempenho(qc); toast.success('Jogo registrado.'); },
    onError: erroPadrao,
  });
}

export function useMatchStats(partidaId: string | null) {
  const { escolaId } = useEscola();
  return useQuery({
    queryKey: ['partida-stats', partidaId],
    enabled: !!partidaId,
    staleTime: 0,
    queryFn: async (): Promise<Record<string, StatsAtleta>> => {
      const { data, error } = await supabase.from('nadgol_partidas_atletas').select('atleta_id, gols, assistencias, minutos, nota').eq('partida_id', partidaId!).eq('escola_id', escolaId);
      falha(error);
      return Object.fromEntries((data ?? []).map((r: any) => [r.atleta_id, { gols: r.gols, assistencias: r.assistencias, minutos: r.minutos, nota: r.nota === null ? null : Number(r.nota) }]));
    },
  });
}

export function useSaveMatchStats() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { partidaId: string; stats: Record<string, StatsAtleta> }) => {
      if (demo) { avisoDemo(); return; }
      const linhas = Object.entries(v.stats)
        .filter(([, s]) => s.gols > 0 || s.assistencias > 0 || s.minutos > 0 || s.nota !== null)
        .map(([atletaId, s]) => ({ partida_id: v.partidaId, atleta_id: atletaId, escola_id: escolaId, gols: s.gols, assistencias: s.assistencias, minutos: s.minutos, nota: s.nota }));
      if (linhas.length) {
        const { error } = await supabase.from('nadgol_partidas_atletas').upsert(linhas, { onConflict: 'partida_id,atleta_id' });
        falha(error);
      }
    },
    onSuccess: () => { invalidaDesempenho(qc); qc.invalidateQueries({ queryKey: ['partida-stats'] }); toast.success('Estatísticas salvas.'); },
    onError: erroPadrao,
  });
}

// ----------------------------------------------------------------------------
// Performance: avaliações físicas e avaliações técnicas/táticas/mentais
// ----------------------------------------------------------------------------
export interface AvalFisica { id: string; data: string; peso: number | null; altura: number | null; vo2: number | null; velocidade: number | null; resistencia: number | null }
export type TipoAvaliacao = 'tecnica' | 'tatica' | 'fisica' | 'mentalidade' | 'disciplina';
export const TIPO_AVALIACAO: Record<TipoAvaliacao, string> = { tecnica: 'Técnica', tatica: 'Tático', fisica: 'Físico', mentalidade: 'Mental', disciplina: 'Disciplina' };
export interface Avaliacao { id: string; tipo: TipoAvaliacao; data: string; nota: number | null; comentario: string | null }

const numOuNull = (x: any) => (x === null || x === undefined ? null : Number(x));

export function usePhysicalEvals(atletaId: string) {
  const { demo } = useEscola();
  return useQuery({
    queryKey: ['aval-fisicas', atletaId],
    enabled: !demo && !!atletaId,
    queryFn: async (): Promise<AvalFisica[]> => {
      const { data, error } = await supabase.from('nadgol_avaliacoes_fisicas')
        .select('id, data, peso_kg, altura_cm, vo2, velocidade, resistencia').eq('atleta_id', atletaId).order('data').limit(60);
      falha(error);
      return (data ?? []).map((r: any) => ({ id: r.id, data: r.data, peso: numOuNull(r.peso_kg), altura: numOuNull(r.altura_cm), vo2: numOuNull(r.vo2), velocidade: numOuNull(r.velocidade), resistencia: numOuNull(r.resistencia) }));
    },
  });
}

export function useCreatePhysicalEval() {
  const { escolaId, demo, userId } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { atletaId: string; data: string; peso?: string; altura?: string; vo2?: string; velocidade?: string; resistencia?: string }) => {
      if (demo) { avisoDemo(); return; }
      const n = (x?: string) => (x === undefined || x === '' ? null : Number(x));
      const { error } = await supabase.from('nadgol_avaliacoes_fisicas').insert({
        escola_id: escolaId, atleta_id: v.atletaId, data: v.data, peso_kg: n(v.peso), altura_cm: n(v.altura),
        vo2: n(v.vo2), velocidade: n(v.velocidade), resistencia: n(v.resistencia), registrado_por: userId,
      });
      falha(error);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['aval-fisicas'] }); toast.success('Avaliação física registrada.'); },
    onError: erroPadrao,
  });
}

export function useEvaluations(atletaId: string) {
  const { demo } = useEscola();
  return useQuery({
    queryKey: ['avaliacoes', atletaId],
    enabled: !demo && !!atletaId,
    queryFn: async (): Promise<Avaliacao[]> => {
      const { data, error } = await supabase.from('nadgol_avaliacoes').select('id, tipo, data, nota, comentario').eq('atleta_id', atletaId).order('data', { ascending: false }).limit(100);
      falha(error);
      return (data ?? []).map((r: any) => ({ id: r.id, tipo: r.tipo, data: r.data, nota: numOuNull(r.nota), comentario: r.comentario }));
    },
  });
}

export function useCreateEvaluation() {
  const { escolaId, demo, userId } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { atletaId: string; tipo: TipoAvaliacao; data: string; nota: string; comentario?: string }) => {
      if (demo) { avisoDemo(); return; }
      const { error } = await supabase.from('nadgol_avaliacoes').insert({
        escola_id: escolaId, atleta_id: v.atletaId, tipo: v.tipo, data: v.data, nota: Math.max(0, Math.min(100, Number(v.nota))),
        comentario: v.comentario?.trim() || null, avaliador_id: userId,
      });
      falha(error);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['avaliacoes'] }); toast.success('Avaliação registrada.'); },
    onError: erroPadrao,
  });
}

// ----------------------------------------------------------------------------
// Performance diária (sono, água, tela, alimentação)
// ----------------------------------------------------------------------------
export interface DiaLog { data: string; sono: number | null; agua: number | null; tela: number | null; refeicoes: number | null }

export function useDailyLogs(atletaId: string) {
  const { demo } = useEscola();
  return useQuery({
    queryKey: ['diario', atletaId],
    enabled: !demo && !!atletaId,
    queryFn: async (): Promise<DiaLog[]> => {
      const desde = new Date(); desde.setDate(desde.getDate() - 13);
      const { data, error } = await supabase.from('nadgol_performance_diaria')
        .select('data, sono_horas, agua_litros, tela_horas, alimentacao_nota').eq('atleta_id', atletaId).gte('data', desde.toLocaleDateString('en-CA')).order('data');
      falha(error);
      return (data ?? []).map((r: any) => ({ data: r.data, sono: numOuNull(r.sono_horas), agua: numOuNull(r.agua_litros), tela: numOuNull(r.tela_horas), refeicoes: r.alimentacao_nota }));
    },
  });
}

export function useSaveDaily() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { atletaId: string; sono: number; agua: number; tela: number; refeicoes: number }) => {
      if (demo) { avisoDemo(); return; }
      const { error } = await supabase.from('nadgol_performance_diaria').upsert({
        escola_id: escolaId, atleta_id: v.atletaId, data: hojeISO(),
        sono_horas: Math.min(24, Math.max(0, v.sono)), agua_litros: Math.min(15, Math.max(0, Math.round(v.agua * 10) / 10)),
        tela_horas: Math.min(24, Math.max(0, Math.round(v.tela * 10) / 10)), alimentacao_nota: Math.min(5, Math.max(1, v.refeicoes)),
      }, { onConflict: 'atleta_id,data' });
      falha(error);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['diario'] }); toast.success('Dia salvo.'); },
    onError: erroPadrao,
  });
}

// ----------------------------------------------------------------------------
// Jornada do atleta
// ----------------------------------------------------------------------------
export type TipoJornada = 'marco' | 'conquista' | 'competicao' | 'evolucao' | 'premiacao' | 'clube';
export type Vinculo = 'teste' | 'temporada' | 'aprovado';
export interface EventoJornada { id: string; data: string; tipo: TipoJornada; titulo: string; descricao: string; clube?: string; tempo?: string; vinculo?: Vinculo; dataFim?: string; escudo?: string }

export function useJourney(atletaId: string) {
  const { demo } = useEscola();
  return useQuery({
    queryKey: ['jornada', atletaId],
    enabled: !demo && !!atletaId,
    queryFn: async (): Promise<EventoJornada[]> => {
      const { data, error } = await supabase.from('nadgol_jornada_eventos').select('id, data, tipo, titulo, descricao, clube, tempo_no_clube, vinculo, data_fim, escudo_url').eq('atleta_id', atletaId).order('data').limit(200);
      falha(error);
      return (data ?? []).map((r: any) => ({ id: r.id, data: r.data, tipo: (['marco', 'conquista', 'competicao', 'evolucao', 'premiacao', 'clube'].includes(r.tipo) ? r.tipo : 'marco') as TipoJornada, titulo: r.titulo, descricao: r.descricao ?? '', clube: r.clube ?? undefined, tempo: r.tempo_no_clube ?? undefined, vinculo: ['teste', 'temporada', 'aprovado'].includes(r.vinculo) ? r.vinculo : undefined, dataFim: r.data_fim ?? undefined, escudo: r.escudo_url ?? undefined }));
    },
  });
}

export function useCreateJourneyEvent() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { atletaId: string; data: string; tipo: TipoJornada; titulo: string; descricao?: string; clube?: string; tempo?: string; vinculo?: Vinculo; dataFim?: string; escudo?: Blob }) => {
      if (demo) { avisoDemo(); return; }
      const escudoUrl = v.escudo ? await enviarEscudo(escolaId, v.atletaId, v.escudo) : null;
      const { error } = await supabase.from('nadgol_jornada_eventos').insert({ escola_id: escolaId, atleta_id: v.atletaId, data: v.data, tipo: v.tipo, titulo: v.titulo.trim(), descricao: v.descricao?.trim() || null, clube: v.clube?.trim() || null, tempo_no_clube: v.tempo?.trim() || null, vinculo: v.vinculo ?? null, data_fim: v.dataFim || null, escudo_url: escudoUrl });
      falha(error);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jornada'] }); toast.success('Evento adicionado à jornada.'); },
    onError: erroPadrao,
  });
}

export function useUpdateJourneyEvent() {
  const { escolaId, demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id: string; atletaId: string; data: string; dataFim?: string; tipo: TipoJornada; titulo: string; descricao?: string; vinculo?: Vinculo; escudo?: Blob | null; escudoAnterior?: string }) => {
      if (demo) { avisoDemo(); return; }
      const clube = v.tipo === 'clube';
      let escudoUrl: string | null | undefined;
      if (clube && v.escudo instanceof Blob) escudoUrl = await enviarEscudo(escolaId, v.atletaId, v.escudo);
      else if (!clube || v.escudo === null) escudoUrl = null;
      const { error } = await supabase.from('nadgol_jornada_eventos').update({
        data: v.data, data_fim: clube ? v.dataFim || null : null, tipo: v.tipo, titulo: v.titulo.trim(), descricao: v.descricao?.trim() || null,
        clube: clube ? v.titulo.trim() : null, vinculo: clube ? v.vinculo ?? null : null,
        ...(escudoUrl !== undefined ? { escudo_url: escudoUrl } : {}),
      }).eq('id', v.id);
      falha(error);
      if (escudoUrl !== undefined && v.escudoAnterior) await removerFotoAntiga(v.escudoAnterior);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jornada'] }); toast.success('Jornada atualizada.'); },
    onError: erroPadrao,
  });
}

export function useDeleteJourneyEvent() {
  const { demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id: string; escudo?: string }) => {
      if (demo) { avisoDemo(); return; }
      const { error } = await supabase.from('nadgol_jornada_eventos').delete().eq('id', v.id);
      falha(error);
      await removerFotoAntiga(v.escudo);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jornada'] }); toast.success('Item removido da jornada.'); },
    onError: erroPadrao,
  });
}

// ----------------------------------------------------------------------------
// Quadro tático (estratégias salvas)
// ----------------------------------------------------------------------------
export interface QuadroTatico { id: string; nome: string; formacao: string; jogadores: any[]; cor: string }

export function useTacticalBoards() {
  const { escolaId, demo } = useEscola();
  return useQuery({
    queryKey: ['quadros', escolaId],
    enabled: !demo && !!escolaId,
    queryFn: async (): Promise<QuadroTatico[]> => {
      const { data, error } = await supabase.from('nadgol_quadros_taticos').select('id, nome, formacao, dados').eq('escola_id', escolaId).order('atualizado_em', { ascending: false }).limit(50);
      falha(error);
      return (data ?? []).map((r: any) => ({ id: r.id, nome: r.nome, formacao: r.formacao, jogadores: Array.isArray(r.dados?.jogadores) ? r.dados.jogadores : [], cor: r.dados?.cor ?? 'red' }));
    },
  });
}

export function useSaveTacticalBoard() {
  const { escolaId, demo, userId } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { nome: string; formacao: string; jogadores: any[]; cor: string }) => {
      if (demo) { avisoDemo(); return; }
      const { error } = await supabase.from('nadgol_quadros_taticos').insert({
        escola_id: escolaId, nome: v.nome.trim(), formacao: v.formacao, dados: { jogadores: v.jogadores, cor: v.cor }, criado_por: userId,
      });
      falha(error);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['quadros'] }); toast.success('Estratégia salva.'); },
    onError: erroPadrao,
  });
}

export function useDeleteTacticalBoard() {
  const { demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (demo) { avisoDemo(); return; }
      const { error } = await supabase.from('nadgol_quadros_taticos').delete().eq('id', id);
      falha(error);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['quadros'] }); toast.success('Estratégia removida.'); },
    onError: erroPadrao,
  });
}

// ----------------------------------------------------------------------------
// XP, conquistas e Mind Game
// ----------------------------------------------------------------------------
export interface XpResumo { xp: number; coins: number; porOrigem: { origem: string; xp: number }[]; conquistas: { id: string; nome: string; icone: string }[] }

export function useAthleteXp(atletaId: string) {
  const { demo } = useEscola();
  return useQuery({
    queryKey: ['xp', atletaId],
    enabled: !demo && !!atletaId,
    queryFn: async (): Promise<XpResumo> => {
      const semana = new Date(); semana.setDate(semana.getDate() - 7);
      const [ev, cq] = await Promise.all([
        supabase.from('nadgol_xp_eventos').select('origem, xp, coins, criado_em').eq('atleta_id', atletaId),
        supabase.from('nadgol_atletas_conquistas').select('conquista:nadgol_conquistas(id, nome, icone)').eq('atleta_id', atletaId),
      ]);
      falha(ev.error); falha(cq.error);
      const eventos = ev.data ?? [];
      const porOrigem = new Map<string, number>();
      for (const e of eventos as any[]) if (new Date(e.criado_em) >= semana) porOrigem.set(e.origem, (porOrigem.get(e.origem) ?? 0) + e.xp);
      return {
        xp: eventos.reduce((t: number, e: any) => t + e.xp, 0),
        coins: eventos.reduce((t: number, e: any) => t + e.coins, 0),
        porOrigem: Array.from(porOrigem.entries()).map(([origem, xp]) => ({ origem, xp })).sort((a, b) => b.xp - a.xp),
        conquistas: (cq.data ?? []).map((r: any) => (Array.isArray(r.conquista) ? r.conquista[0] : r.conquista)).filter(Boolean).map((c: any) => ({ id: c.id, nome: c.nome, icone: c.icone || '🏅' })),
      };
    },
  });
}

export function useXpRanking() {
  const { escolaId, demo } = useEscola();
  return useQuery({
    queryKey: ['xp-ranking', escolaId],
    enabled: !demo && !!escolaId,
    queryFn: async (): Promise<{ id: string; nome: string; xp: number }[]> => {
      const { data, error } = await supabase.rpc('nadgol_ranking', { p_escola: escolaId });
      falha(error);
      return (data ?? []).map((r: any) => ({ id: r.atleta_id, nome: r.nome, xp: Number(r.xp) })).sort((a: any, b: any) => b.xp - a.xp).slice(0, 3);
    },
  });
}

export interface DesafioMG { id: string; cenario: string; opcoes: string[]; xp: number }

export function useMindGame(atletaId: string) {
  const { demo } = useEscola();
  return useQuery({
    queryKey: ['mindgame', atletaId],
    enabled: !demo && !!atletaId,
    staleTime: Infinity, // a lista não muda durante a sessão de jogo
    queryFn: async (): Promise<DesafioMG[]> => {
      const [d, r] = await Promise.all([
        supabase.from('nadgol_mindgame_desafios').select('id, cenario, opcoes, xp').eq('ativo', true).order('criado_em'),
        supabase.from('nadgol_mindgame_respostas').select('desafio_id').eq('atleta_id', atletaId),
      ]);
      falha(d.error); falha(r.error);
      const feitos = new Set((r.data ?? []).map((x: any) => x.desafio_id));
      return (d.data ?? []).filter((x: any) => !feitos.has(x.id)).map((x: any) => ({ id: x.id, cenario: x.cenario, opcoes: Array.isArray(x.opcoes) ? x.opcoes : [], xp: x.xp }));
    },
  });
}

export function useAnswerMindGame() {
  const { demo } = useEscola();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { desafioId: string; atletaId: string; opcao: number }) => {
      if (demo) return null;
      const { data, error } = await supabase.rpc('nadgol_responder_mindgame', { p_desafio: v.desafioId, p_atleta: v.atletaId, p_opcao: v.opcao });
      falha(error);
      const r: any = Array.isArray(data) ? data[0] : data;
      return { correta: !!r?.correta, explicacao: (r?.explicacao ?? '') as string, xp: Number(r?.xp ?? 0) };
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['xp'] }); qc.invalidateQueries({ queryKey: ['xp-ranking'] }); qc.invalidateQueries({ queryKey: ['ranking'] }); },
    onError: () => toast.error('Não foi possível registrar a resposta.'),
  });
}

// ----------------------------------------------------------------------------
// Métricas agregadas por atleta (NadScore, Scout, Radar, Intelligence)
// ----------------------------------------------------------------------------
export interface MetricaAtleta {
  id: string; nome: string; posicao: string; idade: number; categoria: string;
  gols: number; assistencias: number; jogos: number; presenca: number;
  nadscore: number | null;   // média das notas dos jogos (0–10)
  overall: number;           // média das avaliações (0–100); sem avaliação, usa presença
  vo2Evolucao: number | null; // variação % do VO2 entre a primeira e a última medição
  velocidadeMax: number | null;
}
export interface JogoAtleta { id: string; adversario: string; data: string; nadscore: number | null; gols: number; assistencias: number; competicao: boolean }

const idadeDe = (nasc: string) => Math.max(0, Math.floor((Date.now() - new Date(`${nasc}T12:00:00`).getTime()) / (365.25 * 864e5)));
const media = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function useAthleteMetrics() {
  const { escolaId, demo } = useEscola();
  const atl = useAthletes();
  return useQuery({
    queryKey: ['metricas', escolaId, atl.dataUpdatedAt],
    enabled: !demo && !!escolaId && atl.isSuccess,
    queryFn: async (): Promise<MetricaAtleta[]> => {
      const [pa, av, fi] = await Promise.all([
        supabase.from('nadgol_partidas_atletas').select('atleta_id, nota').eq('escola_id', escolaId),
        supabase.from('nadgol_avaliacoes').select('atleta_id, nota').eq('escola_id', escolaId),
        supabase.from('nadgol_avaliacoes_fisicas').select('atleta_id, data, vo2, velocidade').eq('escola_id', escolaId).order('data'),
      ]);
      falha(pa.error); falha(av.error); falha(fi.error);
      return (atl.data ?? []).filter(a => a.status === 'active').map((a): MetricaAtleta => {
        const notas = (pa.data ?? []).filter((r: any) => r.atleta_id === a.id && r.nota !== null).map((r: any) => Number(r.nota));
        const jogos = (pa.data ?? []).filter((r: any) => r.atleta_id === a.id).length;
        const avs = (av.data ?? []).filter((r: any) => r.atleta_id === a.id && r.nota !== null).map((r: any) => Number(r.nota));
        const fis = (fi.data ?? []).filter((r: any) => r.atleta_id === a.id);
        const vo2 = fis.filter((f: any) => f.vo2 !== null).map((f: any) => Number(f.vo2));
        const vel = fis.filter((f: any) => f.velocidade !== null).map((f: any) => Number(f.velocidade));
        const nad = media(notas);
        return {
          id: a.id, nome: a.name, posicao: a.position, idade: idadeDe(a.birthDate), categoria: getCategory(a.birthYear),
          gols: a.goals ?? 0, assistencias: a.assists ?? 0, jogos, presenca: a.attendance ?? 0,
          nadscore: nad === null ? null : Math.round(nad * 10) / 10,
          overall: Math.round(media(avs) ?? (a.attendance ?? 0)),
          vo2Evolucao: vo2.length >= 2 && vo2[0] > 0 ? Math.round(((vo2[vo2.length - 1] - vo2[0]) / vo2[0]) * 100) : null,
          velocidadeMax: vel.length ? Math.max(...vel) : null,
        };
      });
    },
  });
}

export function useMatchLog(atletaId: string) {
  const { demo } = useEscola();
  return useQuery({
    queryKey: ['jogos-atleta', atletaId],
    enabled: !demo && !!atletaId,
    queryFn: async (): Promise<JogoAtleta[]> => {
      const { data, error } = await supabase.from('nadgol_partidas_atletas')
        .select('gols, assistencias, nota, partida:nadgol_partidas(id, adversario, data, competicao_id)').eq('atleta_id', atletaId);
      falha(error);
      return (data ?? []).map((r: any) => {
        const p = Array.isArray(r.partida) ? r.partida[0] : r.partida;
        return { id: p?.id ?? '', adversario: p?.adversario ?? '—', data: p?.data ?? '', nadscore: numOuNull(r.nota), gols: r.gols, assistencias: r.assistencias, competicao: !!p?.competicao_id };
      }).filter(j => j.id).sort((a, b) => b.data.localeCompare(a.data));
    },
  });
}
