import { useApp } from '@/contexts/AppContext';
import { Bell, Menu, Search } from 'lucide-react';
import { NOTIFICATIONS } from '@/lib/data';

const SECTION_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  classes: 'Turmas',
  athletes: 'Atletas',
  attendance: 'Lista de Presença',
  performance: 'Performance',
  competitions: 'Competições',
  financial: 'Financeiro',
  evolution: 'Evolução',
  ranking: 'Ranking',
  notifications: 'Notificações',
  chat: 'Chat Interno',
  settings: 'Configurações',
};

export default function TopHeader() {
  const { currentUser, activeSection, setActiveSection, sidebarOpen, setSidebarOpen } = useApp();
  if (!currentUser) return null;

  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <header style={{
      height: '64px',
      background: '#080808',
      borderBottom: '1px solid #1E1E1E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 20,
    }}>
      {/* Left: hamburger + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ color: 'rgba(255,255,255,0.5)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 700,
            fontSize: '22px',
            color: '#fff',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>
            {SECTION_TITLES[activeSection] || activeSection}
          </h1>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px' }}>
            NADGOL ACADEMY
          </p>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Notification bell */}
        <button
          onClick={() => setActiveSection('notifications')}
          style={{
            position: 'relative',
            width: '38px', height: '38px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid #2A2A2A',
            borderRadius: '6px',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            transition: 'all 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '6px', right: '6px',
              width: '8px', height: '8px',
              background: '#CC1A1A',
              borderRadius: '50%',
              border: '1.5px solid #080808',
            }} />
          )}
        </button>

        {/* User avatar */}
        <div style={{
          width: '38px', height: '38px',
          borderRadius: '6px',
          background: 'linear-gradient(135deg, #CC1A1A, #991414)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 700, fontSize: '18px', color: '#fff',
          border: '1px solid rgba(204,26,26,0.4)',
          cursor: 'pointer',
        }}>
          {currentUser.name.charAt(0)}
        </div>
      </div>
    </header>
  );
}
