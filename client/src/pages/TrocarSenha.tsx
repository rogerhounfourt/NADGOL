import { useState } from 'react';
import { Check, Circle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { REGRAS_SENHA, senhaForte } from '@/lib/senha';

const campo: React.CSSProperties = {
  width: '100%', padding: '12px 14px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px',
  color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', outline: 'none', marginBottom: '12px',
};

/** Primeiro acesso com senha provisória: obriga a criar uma senha própria antes de entrar no app. */
export default function TrocarSenha() {
  const { trocarSenha, signOut } = useApp();
  const [nova, setNova] = useState('');
  const [confirma, setConfirma] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const iguais = nova.length > 0 && nova === confirma;
  const pode = senhaForte(nova) && iguais && !enviando;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pode) return;
    setEnviando(true); setErro(null);
    const msg = await trocarSenha(nova);
    if (msg) { setErro(msg); setEnviando(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <form onSubmit={enviar} style={{ width: '100%', maxWidth: '440px', background: '#111111', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '28px', animation: 'fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <div style={{ width: '3px', height: '22px', background: '#CC1A1A', borderRadius: '2px' }} />
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Crie sua senha</h1>
        </div>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: '18px' }}>
          Você entrou com uma senha provisória. Para continuar, defina uma senha só sua.
        </p>

        <input type="password" autoComplete="new-password" autoFocus placeholder="Nova senha" value={nova} onChange={e => setNova(e.target.value)} style={campo} />
        <input type="password" autoComplete="new-password" placeholder="Repita a nova senha" value={confirma} onChange={e => setConfirma(e.target.value)} style={campo} />

        <ul style={{ listStyle: 'none', padding: 0, margin: '2px 0 14px', display: 'grid', gap: '6px' }}>
          {REGRAS_SENHA.map(r => {
            const ok = r.ok(nova);
            return (
              <li key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: ok ? '#4ADE80' : 'rgba(255,255,255,0.45)' }}>
                {ok ? <Check size={14} /> : <Circle size={14} />} {r.texto}
              </li>
            );
          })}
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: iguais ? '#4ADE80' : 'rgba(255,255,255,0.45)' }}>
            {iguais ? <Check size={14} /> : <Circle size={14} />} As duas senhas são iguais
          </li>
        </ul>

        {erro && <p role="alert" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#FCA5A5', marginBottom: '12px' }}>{erro}</p>}
        <button type="submit" disabled={!pode} className="nadgol-btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', fontSize: '13px', cursor: pode ? 'pointer' : 'not-allowed', opacity: pode ? 1 : 0.5 }}>
          {enviando ? 'Salvando...' : 'Salvar e entrar'}
        </button>
        <button type="button" onClick={() => void signOut()} style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', cursor: 'pointer' }}>
          Sair
        </button>
      </form>
    </div>
  );
}
