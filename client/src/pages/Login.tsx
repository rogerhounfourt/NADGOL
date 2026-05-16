import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { NadgolShield } from '@/components/IntroScreen';
import { USERS, UserRole } from '@/lib/data';
import { Shield, User, Users, Dumbbell } from 'lucide-react';

const ROLE_OPTIONS = [
  { role: 'admin' as UserRole, label: 'Administrador', desc: 'Acesso total ao sistema', icon: Shield, color: '#CC1A1A' },
  { role: 'coach' as UserRole, label: 'Treinador', desc: 'Presença, avaliações e desempenho', icon: Dumbbell, color: '#3B82F6' },
  { role: 'parent' as UserRole, label: 'Responsável', desc: 'Acompanhe seu atleta', icon: Users, color: '#22C55E' },
  { role: 'athlete' as UserRole, label: 'Atleta', desc: 'Seu desempenho e evolução', icon: User, color: '#EAB308' },
];

export default function Login() {
  const { setCurrentUser, setShowIntro } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [hoveredRole, setHoveredRole] = useState<UserRole | null>(null);

  const handleLogin = () => {
    if (!selectedRole) return;
    const user = USERS.find(u => u.role === selectedRole) || USERS[0];
    setCurrentUser(user);
    setShowIntro(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(204,26,26,0.06) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(204,26,26,0.04) 0%, transparent 40%)`,
      }} />

      {/* Grid lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '440px',
        animation: 'fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <NadgolShield size={56} />
          </div>
          <h1 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 900, fontSize: '36px',
            color: '#fff', letterSpacing: '4px',
            textTransform: 'uppercase', lineHeight: 1,
          }}>NADGOL</h1>
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '11px', color: 'rgba(255,255,255,0.4)',
            letterSpacing: '6px', textTransform: 'uppercase', marginTop: '4px',
          }}>ACADEMY</p>
          <div style={{ width: '40px', height: '2px', background: '#CC1A1A', margin: '16px auto 0' }} />
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '12px' }}>
            Selecione seu perfil de acesso
          </p>
        </div>

        {/* Role selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {ROLE_OPTIONS.map(({ role, label, desc, icon: Icon, color }) => {
            const isSelected = selectedRole === role;
            const isHovered = hoveredRole === role;
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                onMouseEnter={() => setHoveredRole(role)}
                onMouseLeave={() => setHoveredRole(null)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 16px',
                  background: isSelected ? `rgba(204,26,26,0.1)` : isHovered ? 'rgba(255,255,255,0.04)' : '#111111',
                  border: `1px solid ${isSelected ? '#CC1A1A' : '#2A2A2A'}`,
                  borderLeft: `3px solid ${isSelected ? '#CC1A1A' : isHovered ? '#3A3A3A' : '#2A2A2A'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 150ms ease-out',
                  textAlign: 'left',
                  transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                }}
              >
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: '8px',
                  background: isSelected ? `rgba(204,26,26,0.2)` : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 150ms',
                }}>
                  <Icon size={20} color={isSelected ? '#CC1A1A' : 'rgba(255,255,255,0.5)'} />
                </div>
                <div>
                  <p style={{
                    fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '14px',
                    color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)',
                  }}>{label}</p>
                  <p style={{
                    fontFamily: 'DM Sans, sans-serif', fontSize: '12px',
                    color: 'rgba(255,255,255,0.35)',
                  }}>{desc}</p>
                </div>
                {isSelected && (
                  <div style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: '#CC1A1A' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={!selectedRole}
          style={{
            width: '100%',
            padding: '14px',
            background: selectedRole ? '#CC1A1A' : '#1A1A1A',
            color: selectedRole ? '#fff' : 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '6px',
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 700, fontSize: '16px',
            letterSpacing: '3px', textTransform: 'uppercase',
            cursor: selectedRole ? 'pointer' : 'not-allowed',
            transition: 'all 150ms ease-out',
            transform: 'scale(1)',
          }}
          onMouseEnter={e => { if (selectedRole) e.currentTarget.style.background = '#E02020'; }}
          onMouseLeave={e => { if (selectedRole) e.currentTarget.style.background = '#CC1A1A'; }}
          onMouseDown={e => { if (selectedRole) e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          ACESSAR PLATAFORMA
        </button>

        <p style={{ textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '20px' }}>
          © 2026 Nadgol Academy · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
