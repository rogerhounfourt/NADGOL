import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { canAccess } from '@/lib/permissions';
import { useNotifications } from '@/lib/queries';
import BolaFutebol from './BolaFutebol';
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
