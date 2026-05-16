import { useEffect, useState } from 'react';
import { UserRole } from '@/lib/data';

interface IntroScreenProps {
  role: UserRole;
  name: string;
  onComplete: () => void;
}

const INTRO_CONFIG = {
  coach: {
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663666237756/iKNeWTuZ5pz2AxmTY4qpFt/intro-coach-aQjQwvLYv57u4foVh4TWAN.webp',
    title: 'BEM-VINDO,',
    subtitle: 'SALA DE COMISSÃO TÉCNICA',
    tagline: 'Onde campeões são formados.',
    roleLabel: 'TREINADOR',
  },
  parent: {
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663666237756/iKNeWTuZ5pz2AxmTY4qpFt/intro-director-WS3nn84cERhjSAZ97Gzg2Q.webp',
    title: 'BEM-VINDO,',
    subtitle: 'SALA DE DIRETORIA',
    tagline: 'Acompanhe a jornada do seu atleta.',
    roleLabel: 'RESPONSÁVEL',
  },
  athlete: {
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663666237756/iKNeWTuZ5pz2AxmTY4qpFt/intro-locker-nJuzFGr4ZdV8oV8ChGuy6y.webp',
    title: 'BEM-VINDO,',
    subtitle: 'VESTIÁRIO NADGOL ACADEMY',
    tagline: 'É hora de mostrar seu talento.',
    roleLabel: 'ATLETA',
  },
  admin: {
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663666237756/iKNeWTuZ5pz2AxmTY4qpFt/intro-ops-8na9rggenVLNwGimmpMeJ2.webp',
    title: 'BEM-VINDO,',
    subtitle: 'CENTRAL OPERACIONAL',
    tagline: 'Gestão total da academia.',
    roleLabel: 'ADMINISTRADOR',
  },
};

export default function IntroScreen({ role, name, onComplete }: IntroScreenProps) {
  const [phase, setPhase] = useState<'image' | 'text' | 'exit'>('image');
  const config = INTRO_CONFIG[role];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 600);
    const t2 = setTimeout(() => setPhase('exit'), 3200);
    const t3 = setTimeout(() => onComplete(), 3700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'opacity 500ms ease-in-out',
      }}
    >
      {/* Background Image with Ken Burns */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={config.image}
          alt="Intro"
          className="w-full h-full object-cover animate-ken-burns"
          style={{ transformOrigin: 'center center' }}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, rgba(8,8,8,0.88) 0%, rgba(8,8,8,0.55) 50%, rgba(8,8,8,0.75) 100%)',
      }} />

      {/* Red accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: '#CC1A1A' }} />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24">
        {/* Role Badge */}
        <div
          className="mb-6"
          style={{
            opacity: phase === 'text' ? 1 : 0,
            transform: phase === 'text' ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 500ms ease-out, transform 500ms cubic-bezier(0.23, 1, 0.32, 1)',
            transitionDelay: '0ms',
          }}
        >
          <span style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '4px',
            color: '#CC1A1A',
            textTransform: 'uppercase',
            background: 'rgba(204,26,26,0.12)',
            border: '1px solid rgba(204,26,26,0.3)',
            padding: '6px 14px',
            borderRadius: '3px',
          }}>
            {config.roleLabel}
          </span>
        </div>

        {/* Main Title */}
        <div
          style={{
            opacity: phase === 'text' ? 1 : 0,
            transform: phase === 'text' ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 600ms ease-out, transform 600ms cubic-bezier(0.23, 1, 0.32, 1)',
            transitionDelay: '100ms',
          }}
        >
          <h1 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 'clamp(40px, 8vw, 88px)',
            fontWeight: 900,
            lineHeight: 1,
            color: '#FFFFFF',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}>
            {config.title}
          </h1>
          <h1 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 'clamp(40px, 8vw, 88px)',
            fontWeight: 900,
            lineHeight: 1,
            color: '#CC1A1A',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}>
            {name.split(' ')[0].toUpperCase()}
          </h1>
        </div>

        {/* Subtitle */}
        <div
          className="mt-4"
          style={{
            opacity: phase === 'text' ? 1 : 0,
            transform: phase === 'text' ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 600ms ease-out, transform 600ms cubic-bezier(0.23, 1, 0.32, 1)',
            transitionDelay: '200ms',
          }}
        >
          <p style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 'clamp(14px, 2.5vw, 22px)',
            fontWeight: 600,
            letterSpacing: '4px',
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
          }}>
            {config.subtitle}
          </p>
        </div>

        {/* Tagline */}
        <div
          className="mt-6"
          style={{
            opacity: phase === 'text' ? 1 : 0,
            transform: phase === 'text' ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 600ms ease-out, transform 600ms cubic-bezier(0.23, 1, 0.32, 1)',
            transitionDelay: '350ms',
          }}
        >
          <div style={{ width: '48px', height: '2px', background: '#CC1A1A', marginBottom: '16px' }} />
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 'clamp(14px, 2vw, 18px)',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.7)',
            fontStyle: 'italic',
          }}>
            {config.tagline}
          </p>
        </div>

        {/* Nadgol Logo */}
        <div
          className="mt-10"
          style={{
            opacity: phase === 'text' ? 1 : 0,
            transition: 'opacity 600ms ease-out',
            transitionDelay: '500ms',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <NadgolShield size={36} />
            <div>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '18px', color: '#fff', letterSpacing: '2px', lineHeight: 1 }}>NADGOL</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 400, fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '3px' }}>ACADEMY</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading bar */}
      <div className="absolute bottom-1 left-0 h-1" style={{
        background: 'rgba(255,255,255,0.15)',
        width: phase === 'text' ? '100%' : '0%',
        transition: 'width 2600ms linear',
        transitionDelay: '600ms',
      }} />
    </div>
  );
}

export function NadgolShield({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M20 2L4 8V22C4 31 11 39 20 44C29 39 36 31 36 22V8L20 2Z" fill="#CC1A1A" />
      <path d="M20 4L6 9.5V22C6 30 12.5 37.5 20 42C27.5 37.5 34 30 34 22V9.5L20 4Z" fill="#111111" />
      <path d="M20 7L8 12V22C8 29 13.5 36 20 40C26.5 36 32 29 32 22V12L20 7Z" fill="#1A1A1A" />
      <text x="20" y="28" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="900" fontSize="13" fill="#CC1A1A" letterSpacing="1">N</text>
      <circle cx="20" cy="20" r="8" fill="none" stroke="#CC1A1A" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}
