import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { LayoutDashboard, Users, ClipboardList, Medal, Bell } from 'lucide-react';

const MOBILE_NAV = [
  { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
  { id: 'athletes', label: 'Atletas', icon: Users },
  { id: 'attendance', label: 'Presença', icon: ClipboardList },
  { id: 'ranking', label: 'Ranking', icon: Medal },
  { id: 'notifications', label: 'Avisos', icon: Bell },
];

export default function MobileNav() {
  const { activeSection, setActiveSection, currentUser } = useApp();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  if (!currentUser || isDesktop) return null;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: '60px',
      background: '#080808',
      borderTop: '1px solid #1E1E1E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 40,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {MOBILE_NAV.map(({ id, label, icon: Icon }) => {
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              padding: '6px 12px',
              background: 'transparent', border: 'none',
              color: isActive ? '#CC1A1A' : 'rgba(255,255,255,0.35)',
              cursor: 'pointer', transition: 'color 150ms',
              minWidth: '48px',
            }}
          >
            <Icon size={20} />
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', fontWeight: isActive ? 600 : 400 }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
