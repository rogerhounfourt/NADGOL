import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
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
      {/* Premium background gradients */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(204,26,26,0.08) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(204,26,26,0.05) 0%, transparent 40%),
                          radial-gradient(circle at 50% 80%, rgba(51,152,255,0.04) 0%, transparent 50%)`,
      }} />

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* Animated shield watermark */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        opacity: 0.08,
        animation: 'float 6s ease-in-out infinite',
      }}>
        <img
          src="/manus-storage/68db7c69-d5fd-4129-8544-30bbc90c29b1_1c2e822c.jpg"
          alt="Background"
          style={{ width: '400px', height: 'auto', filter: 'blur(1px)' }}
        />
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '480px',
        animation: 'fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards',
      }}>
        {/* Header with Shield */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <img
              src="/manus-storage/68db7c69-d5fd-4129-8544-30bbc90c29b1_1c2e822c.jpg"
              alt="Nadgol Academy Shield"
              style={{
                width: '110px',
                height: 'auto',
                filter: 'drop-shadow(0 0 32px rgba(204,26,26,0.4)) drop-shadow(0 8px 24px rgba(0,0,0,0.8))',
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
          }}>NADGOL</h1>
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '12px', color: 'rgba(255,255,255,0.4)',
            letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '16px',
            animation: 'fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) 150ms forwards',
            opacity: 0,
          }}>ACADEMY</p>
          <div style={{
            width: '48px', height: '2px', background: '#CC1A1A', margin: '0 auto 16px',
            animation: 'scaleIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) 200ms forwards',
            opacity: 0,
          }} />
          <p style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.5)',
            letterSpacing: '1px',
            animation: 'fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) 250ms forwards',
            opacity: 0,
          }}>
            Selecione seu perfil de acesso
          </p>
        </div>

        {/* Role Selection Cards */}
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
                  background: isSelected ? '#CC1A1A' : '#111111',
                  border: `2px solid ${isSelected ? '#CC1A1A' : isHovered ? '#2A2A2A' : '#1E1E1E'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 200ms cubic-bezier(0.23, 1, 0.32, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  opacity: 0,
                  animation: `fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) ${300 + idx * 50}ms forwards`,
                  transform: isHovered && !isSelected ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isSelected ? `0 0 24px ${option.color}40` : isHovered ? '0 8px 24px rgba(0,0,0,0.3)' : 'none',
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
                  }}>
                    {option.label}
                  </p>
                  <p style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '12px',
                    color: isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)',
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

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={!selectedRole}
          style={{
            width: '100%',
            padding: '14px',
            background: selectedRole ? '#CC1A1A' : '#1A1A1A',
            color: selectedRole ? '#fff' : 'rgba(255,255,255,0.3)',
            border: `1px solid ${selectedRole ? '#CC1A1A' : '#2A2A2A'}`,
            borderRadius: '8px',
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            cursor: selectedRole ? 'pointer' : 'not-allowed',
            transition: 'all 200ms cubic-bezier(0.23, 1, 0.32, 1)',
            opacity: 0,
            animation: 'fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 550ms forwards',
            boxShadow: selectedRole ? '0 0 24px rgba(204,26,26,0.3)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (selectedRole) {
              e.currentTarget.style.boxShadow = '0 0 32px rgba(204,26,26,0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedRole) {
              e.currentTarget.style.boxShadow = '0 0 24px rgba(204,26,26,0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          Acessar Plataforma
        </button>

        {/* Footer */}
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.3)',
          textAlign: 'center',
          marginTop: '24px',
          letterSpacing: '1px',
          animation: 'fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) 600ms forwards',
          opacity: 0,
        }}>
          © 2026 Nadgol Academy · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
