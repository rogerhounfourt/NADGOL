import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { canAccess } from '@/lib/permissions';
import { useNotifications } from '@/lib/queries';
import { LayoutDashboard, Users, ClipboardList, Medal, Bell, Activity, Zap, Menu } from 'lucide-react';

// Candidatos em ordem de prioridade; cada perfil mostra os 4 primeiros que pode abrir (+ "Mais").
const CANDIDATOS = [
  { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
  { id: 'athletes', label: 'Atletas', icon: Users },
  { id: 'attendance', label: 'Presença', icon: ClipboardList },
  { id: 'performance', label: 'Perfil', icon: Activity },
  { id: 'nadscore', label: 'NadScore', icon: Zap },
  { id: 'ranking', label: 'Ranking', icon: Medal },
  { id: 'notifications', label: 'Avisos', icon: Bell },
];

const MOLA = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

function BolaFutebol({ girar }: { girar: number }) {
  return (
    <span style={{ position: 'relative', display: 'block', width: '50px', height: '50px' }} aria-hidden>
      {/* camada que gira: gomos pretos e costuras */}
      <svg viewBox="0 0 100 100" width="50" height="50" style={{ position: 'absolute', inset: 0, transform: `rotate(${girar}deg)`, transition: `transform 520ms ${MOLA}` }}>
        <defs>
          <radialGradient id="bolaVermelho" cx="50%" cy="50%" r="55%">
            <stop offset="0" stopColor="#D42A2A" />
            <stop offset="1" stopColor="#A81616" />
          </radialGradient>
          <linearGradient id="bolaPreto" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2b2b2b" />
            <stop offset="1" stopColor="#050505" />
          </linearGradient>
          <clipPath id="bolaRecorte"><circle cx="50" cy="50" r="49" /></clipPath>
        </defs>
        <circle cx="50" cy="50" r="49" fill="url(#bolaVermelho)" />
        <g clipPath="url(#bolaRecorte)" strokeLinejoin="round">
          <path d="M50.0 29.0L50.0 17.0M66.2 5.3L87.6 20.8M70.0 43.5L81.4 39.8M97.6 51.5L89.4 76.7M62.3 67.0L69.4 76.7M63.2 95.7L36.8 95.7M37.7 67.0L30.6 76.7M10.6 76.7L2.4 51.5M30.0 43.5L18.6 39.8M12.4 20.8L33.8 5.3" stroke="#5E0909" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <g stroke="#000" strokeWidth="1.2"><polygon points="50.0,29.0 70.0,43.5 62.3,67.0 37.7,67.0 30.0,43.5" fill="url(#bolaPreto)" /><polygon points="50.0,17.0 33.8,5.3 40.0,-13.8 60.0,-13.8 66.2,5.3" fill="url(#bolaPreto)" /><polygon points="81.4,39.8 87.6,20.8 107.5,20.8 113.7,39.8 97.6,51.5" fill="url(#bolaPreto)" /><polygon points="69.4,76.7 89.4,76.7 95.6,95.7 79.4,107.5 63.2,95.7" fill="url(#bolaPreto)" /><polygon points="30.6,76.7 36.8,95.7 20.6,107.5 4.4,95.7 10.6,76.7" fill="url(#bolaPreto)" /><polygon points="18.6,39.8 2.4,51.5 -13.7,39.8 -7.5,20.8 12.4,20.8" fill="url(#bolaPreto)" /></g>
        </g>
      </svg>
      {/* camada fixa: volume, brilho e borda (não gira) */}
      <svg viewBox="0 0 100 100" width="50" height="50" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="bolaSombra" cx="36%" cy="30%" r="78%">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.55" stopColor="#000" stopOpacity="0.08" />
            <stop offset="1" stopColor="#000" stopOpacity="0.6" />
          </radialGradient>
          <linearGradient id="bolaBrilho" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="49" fill="url(#bolaSombra)" />
        <ellipse cx="36" cy="24" rx="19" ry="11" transform="rotate(-32 36 24)" fill="url(#bolaBrilho)" opacity="0.55" />
        <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" />
      </svg>
    </span>
  );
}

export default function MobileNav() {
  const { activeSection, setActiveSection, currentUser, sidebarOpen, setSidebarOpen } = useApp();
  const notificacoes = useNotifications();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [giro, setGiro] = useState(0);
  const [idxAnterior, setIdxAnterior] = useState<number | null>(null);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);


  const naoLidas = (notificacoes.data ?? []).filter(n => !n.read).length;
  const itens = CANDIDATOS.filter(n => currentUser && canAccess(currentUser.role, n.id)).slice(0, 4);
  const todos = [...itens, { id: '__mais', label: 'Mais', icon: Menu }];
  const idxAtivo = sidebarOpen ? todos.length - 1 : todos.findIndex(i => i.id === activeSection);
  const larg = 100 / todos.length;

  // a bola rola conforme se move: ~1 volta a cada 2 posições, para o lado em que anda
  useEffect(() => {
    if (idxAtivo < 0) return;
    if (idxAnterior !== null) setGiro(g => g + (idxAtivo - idxAnterior) * 200);
    setIdxAnterior(idxAtivo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idxAtivo]);

  if (!currentUser || isDesktop) return null;

  return (
    <nav
      aria-label="Navegação principal"
      style={{
        position: 'fixed',
        left: '14px', right: '14px',
        bottom: 'calc(12px + env(safe-area-inset-bottom))',
        height: '64px',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        borderRadius: '32px',
        background: 'linear-gradient(180deg, rgba(34,34,34,0.72), rgba(14,14,14,0.78))',
        backdropFilter: 'blur(22px) saturate(160%)',
        WebkitBackdropFilter: 'blur(22px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* bolha que desliza até o item ativo */}
      {idxAtivo >= 0 && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: '-14px',
            left: `calc(${idxAtivo * larg + larg / 2}% - 25px)`,
            width: '50px', height: '50px', borderRadius: '50%',
            boxShadow: '0 10px 22px rgba(0,0,0,0.6), 0 0 0 3px #080808, 0 0 18px rgba(204,26,26,0.45)',
            transition: `left 520ms ${MOLA}`,
            pointerEvents: 'none',
          }}
        >
          <BolaFutebol girar={giro} />
        </span>
      )}
      {todos.map(({ id, label, icon: Icon }, i) => {
        const ativo = i === idxAtivo;
        const mais = id === '__mais';
        return (
          <button
            key={id}
            onClick={() => (mais ? setSidebarOpen(!sidebarOpen) : (setSidebarOpen(false), setActiveSection(id)))}
            aria-label={label}
            aria-current={ativo ? 'page' : undefined}
            style={{
              position: 'relative', zIndex: 1,
              flex: 1, height: '100%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: ativo ? '#fff' : 'rgba(255,255,255,0.45)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* ativo: a bola de futebol (desenhada acima) já marca a aba; só o nome aparece */}
            <span style={{
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px',
              opacity: ativo ? 0 : 1,
              transform: ativo ? 'scale(0.6)' : 'scale(1)',
              transition: `opacity 200ms, transform 420ms ${MOLA}`,
            }}>
              <Icon size={22} strokeWidth={1.9} />
              {id === 'notifications' && naoLidas > 0 && (
                <span style={{
                  position: 'absolute', top: '-3px', right: '-6px', minWidth: '16px', height: '16px', padding: '0 4px',
                  borderRadius: '8px', background: '#CC1A1A', color: '#fff', fontSize: '10px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #101010', boxSizing: 'content-box',
                }}>
                  {naoLidas > 9 ? '9+' : naoLidas}
                </span>
              )}
            </span>
            <span style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: '10px', fontWeight: ativo ? 700 : 500, letterSpacing: '0.3px',
              position: 'absolute', bottom: '8px',
              opacity: ativo ? 1 : 0.0,
              transform: ativo ? 'translateY(0)' : 'translateY(4px)',
              transition: 'opacity 250ms, transform 250ms',
              color: '#fff',
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
