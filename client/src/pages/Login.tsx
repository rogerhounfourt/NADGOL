import { useEffect, useState } from 'react';
import { useApp, guardarConvite } from '@/contexts/AppContext';
import { USERS, UserRole } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { Shield, User, Users, Dumbbell } from 'lucide-react';

const ROLE_OPTIONS = [
  { role: 'admin' as UserRole, label: 'Administrador', desc: 'Acesso total ao sistema', icon: Shield, color: '#CC1A1A' },
  { role: 'coach' as UserRole, label: 'Treinador', desc: 'Presença, avaliações e desempenho', icon: Dumbbell, color: '#3B82F6' },
  { role: 'parent' as UserRole, label: 'Responsável', desc: 'Acompanhe seu atleta', icon: Users, color: '#22C55E' },
  { role: 'athlete' as UserRole, label: 'Atleta', desc: 'Seu desempenho e evolução', icon: User, color: '#EAB308' },
];

type Modo = 'entrar' | 'cadastro' | 'recuperar';

const campoStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px', background: 'rgba(17,17,17,0.85)', backdropFilter: 'blur(10px)',
  border: '2px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff',
  fontFamily: 'DM Sans, sans-serif', fontSize: '14px', outline: 'none',
};

export default function Login() {
  const { setCurrentUser, setShowIntro, demo, signIn, signUp, recuperarSenha } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [hoveredRole, setHoveredRole] = useState<UserRole | null>(null);

  // Login real
  const [modo, setModo] = useState<Modo>('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [convite, setConvite] = useState<{ escola: string; papel: string } | null>(null);

  // Link de convite: /convite/<token>
  useEffect(() => {
    if (demo) return;
    const m = window.location.pathname.match(/^\/convite\/([0-9a-f-]{36})$/i);
    if (!m) return;
    guardarConvite(m[1]);
    setModo('cadastro');
    supabase.rpc('nadgol_ver_convite', { p_token: m[1] }).then(({ data }) => {
      const c = Array.isArray(data) ? data[0] : null;
      if (c) { setConvite({ escola: c.escola_nome, papel: c.papel }); if (c.nome) setNome(c.nome); }
      else setErro('Este convite é inválido ou já expirou. Peça um novo à escolinha.');
    });
  }, [demo]);

  const handleLogin = () => {
    if (!selectedRole) return;
    const user = USERS.find(u => u.role === selectedRole) || USERS[0];
    setCurrentUser(user);
    setShowIntro(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    setErro(null); setAviso(null); setEnviando(true);
    let msg: string | null = null;
    if (modo === 'entrar') {
      msg = await signIn(email, senha);
      if (!msg) setShowIntro(true);
    } else if (modo === 'cadastro') {
      msg = await signUp(email, senha, nome);
      if (!msg) setShowIntro(true);
      else if (msg.startsWith('Cadastro criado')) { setAviso(msg); msg = null; setModo('entrar'); }
    } else {
      msg = await recuperarSenha(email);
      if (!msg) setAviso('Se este e-mail tiver cadastro, enviamos o link para criar uma nova senha.');
    }
    setErro(msg);
    setEnviando(false);
  };

  const podeEnviar = demo ? !!selectedRole : (!!email && (modo === 'recuperar' || senha.length > 0) && (modo !== 'cadastro' || nome.trim().length > 1) && !enviando);
  const PAPEL_LABEL: Record<string, string> = { admin: 'Administrador', treinador: 'Treinador', responsavel: 'Responsável', atleta: 'Atleta' };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663666237756/iKNeWTuZ5pz2AxmTY4qpFt/login-hero-nadgol-4hs9e7e4oFJSQFj2Dx4Y8S.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      {/* Premium dark overlay with gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(8,8,8,0.75) 0%, rgba(8,8,8,0.65) 50%, rgba(8,8,8,0.75) 100%)',
        backdropFilter: 'blur(2px)',
      }} />

      {/* Animated accent glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '-10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(204,26,26,0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'pulse 4s ease-in-out infinite',
      }} />

      <form onSubmit={demo ? e => e.preventDefault() : handleSubmit} style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '480px',
        animation: 'fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards',
      }}>
        {/* Header with Shield */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <img
              src="/escudo-nadgol.svg"
              alt="Nadgol Academy Shield"
              style={{
                width: '110px',
                height: 'auto',
                filter: 'drop-shadow(0 0 32px rgba(204,26,26,0.5)) drop-shadow(0 8px 24px rgba(0,0,0,0.9))',
                animation: 'fadeInDown 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards',
              }}
            />
          </div>
          <h1 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 900, fontSize: '42px',
            color: '#fff', letterSpacing: '3px',
            textTransform: 'uppercase', lineHeight: 1, marginBottom: '8px',
            animation: 'fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) 100ms forwards',
            opacity: 0,
            textShadow: '0 4px 16px rgba(0,0,0,0.8)',
          }}>NADGOL</h1>
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '12px', color: 'rgba(255,255,255,0.5)',
            letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '16px',
            animation: 'fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) 150ms forwards',
            opacity: 0,
            textShadow: '0 2px 8px rgba(0,0,0,0.7)',
          }}>ACADEMY</p>
          <div style={{
            width: '48px', height: '2px', background: '#CC1A1A', margin: '0 auto 16px',
            animation: 'scaleIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) 200ms forwards',
            opacity: 0,
            boxShadow: '0 0 16px rgba(204,26,26,0.6)',
          }} />
          <p style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.6)',
            letterSpacing: '1px',
            animation: 'fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) 250ms forwards',
            opacity: 0,
            textShadow: '0 2px 8px rgba(0,0,0,0.7)',
          }}>
            {demo ? 'Selecione seu perfil de acesso'
              : convite ? `Convite · ${convite.escola} · ${PAPEL_LABEL[convite.papel] ?? ''}`
              : modo === 'entrar' ? 'Acesse com seu e-mail e senha'
              : modo === 'cadastro' ? 'Crie seu acesso'
              : 'Recuperar senha'}
          </p>
        </div>

        {/* Modo demonstração: seleção de perfil. Modo real: e-mail e senha. */}
        {demo ? (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
          {ROLE_OPTIONS.map((option, idx) => {
            const Icon = option.icon;
            const isSelected = selectedRole === option.role;
            const isHovered = hoveredRole === option.role;

            return (
              <button
                key={option.role}
                onClick={() => setSelectedRole(option.role)}
                onMouseEnter={() => setHoveredRole(option.role)}
                onMouseLeave={() => setHoveredRole(null)}
                style={{
                  padding: '20px',
                  background: isSelected ? '#CC1A1A' : 'rgba(17,17,17,0.85)',
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${isSelected ? '#CC1A1A' : isHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 200ms cubic-bezier(0.23, 1, 0.32, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  opacity: 0,
                  animation: `fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) ${300 + idx * 50}ms forwards`,
                  transform: isHovered && !isSelected ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isSelected ? `0 0 24px ${option.color}60, inset 0 0 20px rgba(255,255,255,0.1)` : isHovered ? '0 8px 24px rgba(0,0,0,0.5)' : 'none',
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(255,255,255,0.15)' : `${option.color}15`,
                  border: `1px solid ${isSelected ? 'rgba(255,255,255,0.2)' : `${option.color}30`}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  backdropFilter: 'blur(10px)',
                }}>
                  <Icon size={24} color={isSelected ? '#fff' : option.color} strokeWidth={1.5} />
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <p style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: isSelected ? '#fff' : '#fff',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    marginBottom: '2px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  }}>
                    {option.label}
                  </p>
                  <p style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '12px',
                    color: isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)',
                    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                  }}>
                    {option.desc}
                  </p>
                </div>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: `2px solid ${isSelected ? '#fff' : 'rgba(255,255,255,0.2)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 200ms',
                }}>
                  {isSelected && (
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#fff',
                    }} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
        ) : (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '24px', opacity: 0, animation: 'fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 300ms forwards' }}>
          {modo === 'cadastro' && (
            <input style={campoStyle} placeholder="Seu nome completo" autoComplete="name" value={nome} onChange={e => setNome(e.target.value)} required />
          )}
          <input style={campoStyle} type="email" placeholder="E-mail" autoComplete="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} required />
          {modo !== 'recuperar' && (
            <input style={campoStyle} type="password" placeholder={modo === 'cadastro' ? 'Crie uma senha (mín. 8 caracteres)' : 'Senha'} autoComplete={modo === 'cadastro' ? 'new-password' : 'current-password'} minLength={modo === 'cadastro' ? 8 : undefined} value={senha} onChange={e => setSenha(e.target.value)} required />
          )}
          {erro && <p role="alert" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#FCA5A5', background: 'rgba(204,26,26,0.15)', border: '1px solid rgba(204,26,26,0.4)', borderRadius: '8px', padding: '10px 12px' }}>{erro}</p>}
          {aviso && <p role="status" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#86EFAC', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '8px', padding: '10px 12px' }}>{aviso}</p>}
        </div>
        )}

        {/* Login Button */}
        <button
          type={demo ? 'button' : 'submit'}
          onClick={demo ? handleLogin : undefined}
          disabled={!podeEnviar}
          style={{
            width: '100%',
            padding: '14px',
            background: podeEnviar ? '#CC1A1A' : 'rgba(26,26,26,0.7)',
            color: podeEnviar ? '#fff' : 'rgba(255,255,255,0.3)',
            border: `1px solid ${podeEnviar ? '#CC1A1A' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '8px',
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            cursor: podeEnviar ? 'pointer' : 'not-allowed',
            transition: 'all 200ms cubic-bezier(0.23, 1, 0.32, 1)',
            opacity: 0,
            animation: 'fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 550ms forwards',
            boxShadow: podeEnviar ? '0 0 24px rgba(204,26,26,0.4), inset 0 0 20px rgba(255,255,255,0.1)' : 'none',
            backdropFilter: 'blur(10px)',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
          onMouseEnter={(e) => {
            if (podeEnviar) {
              e.currentTarget.style.boxShadow = '0 0 32px rgba(204,26,26,0.6), inset 0 0 20px rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (podeEnviar) {
              e.currentTarget.style.boxShadow = '0 0 24px rgba(204,26,26,0.4), inset 0 0 20px rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {demo ? 'Acessar Plataforma' : enviando ? 'Aguarde...' : modo === 'entrar' ? 'Entrar' : modo === 'cadastro' ? 'Criar acesso' : 'Enviar link'}
        </button>

        {!demo && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', opacity: 0, animation: 'fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) 600ms forwards' }}>
            {(['entrar', 'cadastro', 'recuperar'] as Modo[]).filter(m => m !== modo).map(m => (
              <button key={m} type="button" onClick={() => { setModo(m); setErro(null); setAviso(null); }}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.65)', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px', padding: '6px 0' }}>
                {m === 'entrar' ? 'Já tenho acesso' : m === 'cadastro' ? 'Tenho um convite' : 'Esqueci a senha'}
              </button>
            ))}
          </div>
        )}
        {demo && (
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: '#EAB308', textAlign: 'center', marginTop: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Modo demonstração · dados de exemplo
          </p>
        )}


        {/* Footer */}
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center',
          marginTop: '24px',
          letterSpacing: '1px',
          animation: 'fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) 600ms forwards',
          opacity: 0,
          textShadow: '0 1px 3px rgba(0,0,0,0.7)',
        }}>
          © 2026 Nadgol Academy · Todos os direitos reservados
        </p>
      </form>
    </div>
  );
}
