import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { User, UserRole } from '@/lib/data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const PAPEL_PARA_ROLE: Record<string, UserRole> = {
  admin: 'admin', treinador: 'coach', responsavel: 'parent', atleta: 'athlete',
};
const CONVITE_KEY = 'nadgol_convite';
const ESCOLA_KEY = 'nadgol_escola_ativa';

export interface EscolaVinculo { id: string; nome: string; logoUrl: string | null; role: UserRole; atletaId?: string }

interface AppContextType {
  currentUser: User | null;
  /** null = sair. Com usuário = entrar no modo demonstração. */
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  /** true enquanto a sessão está sendo restaurada */
  loading: boolean;
  /** Sem Supabase configurado: dados de exemplo, sem login real */
  demo: boolean;
  /** Logado, mas ainda sem vínculo com nenhuma escolinha */
  semVinculo: boolean;
  escolas: EscolaVinculo[];
  trocarEscola: (id: string) => void;
  /** Recarrega as escolinhas do usuário (ex.: depois de criar uma nova) */
  recarregarEscolas: () => Promise<void>;
  signIn: (email: string, senha: string) => Promise<string | null>;
  signUp: (email: string, senha: string, nome: string) => Promise<string | null>;
  recuperarSenha: (email: string) => Promise<string | null>;
  aceitarConvite: (token: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  showIntro: boolean;
  setShowIntro: (v: boolean) => void;
  activeSection: string;
  setActiveSection: (s: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function traduzErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (m.includes('already registered')) return 'Este e-mail já tem cadastro. Use "Entrar".';
  if (m.includes('password')) return 'A senha precisa ter pelo menos 8 caracteres.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas. Aguarde um minuto.';
  if (m.includes('convite')) return msg;
  if (m.includes('fetch')) return 'Sem conexão com o servidor. Tente novamente.';
  return 'Não foi possível concluir. Tente novamente.';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const demo = !isSupabaseConfigured;
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();

  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<{ nome: string; email: string; superAdmin: boolean } | null>(null);
  const [escolas, setEscolas] = useState<EscolaVinculo[]>([]);
  const [escolaAtiva, setEscolaAtiva] = useState<string | null>(() => {
    try { return localStorage.getItem(ESCOLA_KEY); } catch { return null; }
  });
  const [demoUser, setDemoUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!demo);
  const [showIntro, setShowIntro] = useState(false);
  const uidRef = useRef<string | null>(null);
  useState(() => {
    const m = typeof window !== 'undefined' ? window.location.pathname.match(/^\/convite\/([0-9a-f-]{36})$/i) : null;
    if (m) guardarConvite(m[1]);
    return null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  // Sessão: só guarda o id aqui; os dados são carregados no efeito abaixo
  useEffect(() => {
    if (demo) return;
    supabase.auth.getSession().then(({ data }) => {
      uidRef.current = data.session?.user.id ?? null;
      setAuthUserId(data.session?.user.id ?? null);
      if (!data.session) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const uid = session?.user.id ?? null;
      // Novo login: já entra em "carregando" para não piscar a tela de "sem vínculo"
      if (uid && uid !== uidRef.current) setLoading(true);
      uidRef.current = uid;
      setAuthUserId(uid);
      if (!session) { setPerfil(null); setEscolas([]); setLoading(false); }
    });
    return () => sub.subscription.unsubscribe();
  }, [demo]);

  const carregarVinculos = useCallback(async (uid: string) => {
    await supabase.rpc('nadgol_garantir_perfil');

    // Convite pendente (usuário chegou por um link /convite/<token>)
    let token: string | null = null;
    try { token = sessionStorage.getItem(CONVITE_KEY); } catch { /* ignore */ }
    if (token) {
      await supabase.rpc('nadgol_aceitar_convite', { p_token: token });
      try { sessionStorage.removeItem(CONVITE_KEY); } catch { /* ignore */ }
    }

    const [{ data: p }, { data: ms }] = await Promise.all([
      supabase.from('nadgol_perfis').select('nome, email, super_admin').eq('id', uid).maybeSingle(),
      supabase.from('nadgol_membros')
        .select('papel, atleta_id, escola:nadgol_escolas(id, nome, logo_url, status)')
        .eq('usuario_id', uid).eq('ativo', true),
    ]);
    setPerfil(p ? { nome: p.nome, email: p.email, superAdmin: p.super_admin } : null);
    const lista: EscolaVinculo[] = [];
    for (const m of (ms ?? []) as any[]) {
      const e = Array.isArray(m.escola) ? m.escola[0] : m.escola;
      if (!e || e.status !== 'ativa') continue;
      lista.push({ id: e.id, nome: e.nome, logoUrl: e.logo_url, role: PAPEL_PARA_ROLE[m.papel] ?? 'parent', atletaId: m.atleta_id ?? undefined });
    }
    setEscolas(lista);
  }, []);

  useEffect(() => {
    if (demo || !authUserId) return;
    let vivo = true;
    setLoading(true);
    carregarVinculos(authUserId).finally(() => { if (vivo) setLoading(false); });
    return () => { vivo = false; };
  }, [demo, authUserId, carregarVinculos]);

  const escola = useMemo(
    () => escolas.find(e => e.id === escolaAtiva) ?? escolas[0] ?? null,
    [escolas, escolaAtiva],
  );

  const currentUser: User | null = useMemo(() => {
    if (demo) return demoUser;
    if (!authUserId || !perfil || !escola) return null;
    return {
      id: authUserId, name: perfil.nome || perfil.email, email: perfil.email, role: escola.role,
      escolaId: escola.id, escolaNome: escola.nome, atletaId: escola.atletaId, superAdmin: perfil.superAdmin,
    };
  }, [demo, demoUser, authUserId, perfil, escola]);

  const signOut = useCallback(async () => {
    setShowIntro(false);
    setDemoUser(null);
    queryClient.clear();
    if (!demo) await supabase.auth.signOut();
    navigate('/');
  }, [demo, navigate, queryClient]);

  const setCurrentUser = useCallback((user: User | null) => {
    if (!user) { void signOut(); return; }
    if (demo) setDemoUser(user);
  }, [demo, signOut]);

  const signIn = useCallback(async (email: string, senha: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    return error ? traduzErro(error.message) : null;
  }, []);

  const signUp = useCallback(async (email: string, senha: string, nome: string) => {
    if (senha.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.';
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: senha, options: { data: { full_name: nome.trim() } } });
    if (error) return traduzErro(error.message);
    if (!data.session) return 'Cadastro criado. Confirme pelo link enviado ao seu e-mail e depois entre.';
    await supabase.rpc('nadgol_garantir_perfil', { p_nome: nome.trim() });
    return null;
  }, []);

  const recuperarSenha = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
    return error ? traduzErro(error.message) : null;
  }, []);

  const aceitarConvite = useCallback(async (token: string) => {
    const { error } = await supabase.rpc('nadgol_aceitar_convite', { p_token: token.trim() });
    if (error) return error.message.includes('Convite') ? 'Convite inválido ou expirado.' : traduzErro(error.message);
    if (authUserId) await carregarVinculos(authUserId);
    return null;
  }, [authUserId, carregarVinculos]);

  const trocarEscola = useCallback((id: string) => {
    setEscolaAtiva(id);
    try { localStorage.setItem(ESCOLA_KEY, id); } catch { /* ignore */ }
    queryClient.clear();
  }, [queryClient]);

  const recarregarEscolas = useCallback(async () => {
    if (authUserId) await carregarVinculos(authUserId);
  }, [authUserId, carregarVinculos]);

  // A URL é a fonte da verdade da tela ativa: /atletas → 'athletes'
  const activeSection = location.split('/')[1] || 'dashboard';
  const setActiveSection = useCallback((s: string) => navigate(`/${s}`), [navigate]);

  const value: AppContextType = {
    currentUser, setCurrentUser,
    isAuthenticated: !!currentUser,
    loading, demo,
    semVinculo: !demo && !!authUserId && !loading && !currentUser,
    escolas, trocarEscola, recarregarEscolas,
    signIn, signUp, recuperarSenha, aceitarConvite, signOut,
    showIntro, setShowIntro,
    activeSection, setActiveSection,
    sidebarOpen, setSidebarOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function guardarConvite(token: string) {
  try { sessionStorage.setItem(CONVITE_KEY, token); } catch { /* ignore */ }
}
