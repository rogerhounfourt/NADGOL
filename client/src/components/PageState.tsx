import { Loader2 } from 'lucide-react';

const base: React.CSSProperties = {
  padding: '48px 24px', textAlign: 'center', background: '#111111', border: '1px solid #1E1E1E', borderRadius: '8px',
  fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.5)',
};

export function Loading({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div style={{ ...base, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
      <Loader2 size={16} color="#CC1A1A" className="animate-spin" /> {label}
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div style={base}>
      <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '18px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: hint ? '6px' : 0 }}>{title}</p>
      {hint && <p>{hint}</p>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div style={{ ...base, borderColor: 'rgba(239,68,68,0.3)' }}>
      <p style={{ color: '#fff', marginBottom: '10px' }}>Não foi possível carregar os dados.</p>
      {onRetry && (
        <button onClick={onRetry} className="nadgol-btn-primary" style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '12px', border: 'none', cursor: 'pointer' }}>
          Tentar de novo
        </button>
      )}
    </div>
  );
}

/** Tela inteira, usada enquanto a sessão é restaurada ou uma página é baixada */
export function FullScreenLoading() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={28} color="#CC1A1A" className="animate-spin" />
    </div>
  );
}
