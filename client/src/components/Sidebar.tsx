import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { NadgolShield } from './IntroScreen';
import { ROLE_PERMISSIONS, rotuloSecao } from '@/lib/permissions';
import {
  LayoutDashboard, Users, UserCheck, ClipboardList, Activity,
  Trophy, DollarSign, TrendingUp, Medal, Bell, MessageSquare,
  Settings, ChevronLeft, ChevronRight, LogOut, Zap, BookOpen, Eye, Brain, Heart, Radar, Clipboard, Lightbulb, KeyRound
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'classes', label: 'Turmas', icon: Users },
  { id: 'athletes', label: 'Atletas', icon: UserCheck },
  { id: 'attendance', label: 'Presença', icon: ClipboardList },
  { id: 'performance', label: 'Performance', icon: Activity },
  { id: 'nadscore', label: 'NadScore', icon: Zap },
  { id: 'journey', label: 'Jornada', icon: BookOpen },
  { id: 'scout', label: 'Scout', icon: Eye },
  { id: 'intelligence', label: 'Intelligence', icon: Brain },
  { id: 'mentality', label: 'Mentalidade', icon: Heart },
  { id: 'radar', label: 'Radar', icon: Radar },
  { id: 'tactical', label: 'Tactical Board', icon: Clipboard },
  { id: 'daily', label: 'Performance Diária', icon: Activity },
  { id: 'mindgame', label: 'Mind Game', icon: Lightbulb },
  { id: 'profile', label: 'Meu Perfil', icon: Users },
  { id: 'competitions', label: 'Competições', icon: Trophy },
  { id: 'financial', label: 'Financeiro', icon: DollarSign },
  { id: 'evolution', label: 'Evolução', icon: TrendingUp },
  { id: 'ranking', label: 'Ranking', icon: Medal },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'chat', label: 'Chat Interno', icon: MessageSquare },
  { id: 'access', label: 'Acessos', icon: KeyRound },
  { id: 'settings', label: 'Configurações', icon: Settings },
];


export default function Sidebar() {
  const { currentUser, activeSection, setActiveSection, sidebarOpen, setSidebarOpen, setCurrentUser, setShowIntro } = useApp();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  if (!currentUser) return null;

  const allowed = ROLE_PERMISSIONS[currentUser.role] || [];

  const handleLogout = () => {
    setCurrentUser(null);
    setShowIntro(false);
  };

  const isVisible = isDesktop || sidebarOpen;
  const showLabels = sidebarOpen;

  return (
    <>
      {/* Mobile overlay */}
      {!isDesktop && sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 30,
          background: '#080808',
          borderRight: '1px solid #1E1E1E',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 250ms cubic-bezier(0.23, 1, 0.32, 1), transform 250ms cubic-bezier(0.23, 1, 0.32, 1)',
          width: isDesktop ? (sidebarOpen ? '240px' : '64px') : '240px',
          overflow: 'hidden',
          transform: !isDesktop && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        {/* Logo */}
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          padding: showLabels ? '0 16px' : '0',
          justifyContent: showLabels ? 'space-between' : 'center',
          borderBottom: '1px solid #1E1E1E',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', filter: 'drop-shadow(0 0 12px rgba(204,26,26,0.25))' }}>
            <img
              src="/escudo-nadgol.svg"
              alt="Nadgol Academy Shield"
              style={{ width: '40px', height: 'auto' }}
            />
            {showLabels && (
              <div style={{ whiteSpace: 'nowrap' }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '16px', color: '#fff', letterSpacing: '2px', lineHeight: 1 }}>NADGOL</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 400, fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '3px' }}>ACADEMY</p>
              </div>
            )}
          </div>
          {showLabels && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ color: 'rgba(255,255,255,0.3)', padding: '4px', borderRadius: '4px', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color 150ms' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* User info */}
        {showLabels && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1E1E1E', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #CC1A1A, #991414)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff',
                flexShrink: 0,
              }}>
                {currentUser.name.charAt(0)}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '13px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.name}
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: '#CC1A1A', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'coach' ? 'Treinador' : currentUser.role === 'parent' ? 'Responsável' : 'Atleta'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
          {NAV_ITEMS.filter(item => allowed.includes(item.id)).map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); if (!isDesktop) setSidebarOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: showLabels ? '10px 16px' : '10px 0',
                  justifyContent: showLabels ? 'flex-start' : 'center',
                  background: isActive ? 'rgba(204,26,26,0.08)' : 'transparent',
                  borderLeft: isActive ? '2px solid #CC1A1A' : '2px solid transparent',
                  color: isActive ? '#CC1A1A' : 'rgba(255,255,255,0.5)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 150ms ease-out',
                  whiteSpace: 'nowrap',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {showLabels && rotuloSecao(currentUser?.role, item.id, item.label)}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{ borderTop: '1px solid #1E1E1E', padding: '8px 0', flexShrink: 0 }}>
          {isDesktop && !sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', color: 'rgba(255,255,255,0.4)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color 150ms' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
              <ChevronRight size={18} />
            </button>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: showLabels ? '10px 16px' : '10px 0',
              justifyContent: showLabels ? 'flex-start' : 'center',
              color: 'rgba(255,255,255,0.3)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 150ms',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {showLabels && 'Sair'}
          </button>
        </div>
      </aside>
    </>
  );
}
