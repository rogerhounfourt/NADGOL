import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

/** Usuário autenticado que ainda não pertence a nenhuma escolinha */
export default function SemVinculo() {
  const { aceitarConvite, signOut } = useApp();
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = codigo.trim().split('/').pop() ?? '';
    if (!/^[0-9a-f-]{36}$/i.test(token)) { setErro('Cole o código ou o link completo do convite.'); return; }
    setEnviando(true); setErro(null);
    setErro(await aceitarConvite(token));
    setEnviando(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <form onSubmit={enviar} style={{ width: '100%', maxWidth: '440px', background: '#111111', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '28px', animation: 'fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <div style={{ width: '3px', height: '22px', background: '#CC1A1A', borderRadius: '2px' }} />
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Falta vincular sua conta</h1>
        </div>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: '20px' }}>
          Seu acesso foi criado, mas ainda não está ligado a uma escolinha. Cole abaixo o convite que a escolinha enviou.
        </p>
        <input
          value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Código ou link do convite" autoFocus
          style={{ width: '100%', padding: '12px 14px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', outline: 'none', marginBottom: '12px' }}
        />
        {erro && <p role="alert" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#FCA5A5', marginBottom: '12px' }}>{erro}</p>}
        <button type="submit" disabled={enviando || !codigo.trim()} className="nadgol-btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', fontSize: '13px', cursor: 'pointer', opacity: enviando || !codigo.trim() ? 0.5 : 1 }}>
          {enviando ? 'Verificando...' : 'Vincular conta'}
        </button>
        <button type="button" onClick={() => void signOut()} style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', cursor: 'pointer' }}>
          Sair
        </button>
      </form>
    </div>
  );
}
