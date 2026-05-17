import { useState } from 'react';
import { Zap, Droplet, Moon, Brain, Heart, TrendingUp } from 'lucide-react';

export default function AthleteProfile() {
  const [xp, setXp] = useState(2450);
  const [coins, setCoins] = useState(1250);
  const [level, setLevel] = useState(Math.floor(xp / 500) + 1);
  const [skinTone, setSkinTone] = useState('medium');
  const [hair, setHair] = useState('black');

  // Calculate avatar stage based on XP
  const getAvatarStage = (xpValue: number) => {
    const stages = [
      { name: 'Sedentário', emoji: '😴', color: '#666' },
      { name: 'Acima do Peso', emoji: '😐', color: '#FFA500' },
      { name: 'Normal', emoji: '🙂', color: '#00D4FF' },
      { name: 'Condicionado', emoji: '💪', color: '#22C55E' },
      { name: 'Alta Performance', emoji: '⚡', color: '#CC1A1A' },
      { name: 'Elite / No Shape', emoji: '🔥', color: '#FFD700' },
    ];
    const stageIndex = Math.min(Math.floor(xpValue / 500), stages.length - 1);
    return stages[stageIndex];
  };

  const stage = getAvatarStage(xp);

  return (
    <div style={{ padding: '24px', background: '#0a0a0a', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '32px', fontWeight: 800, color: '#fff', letterSpacing: '2px', margin: 0, marginBottom: '8px' }}>
          MEU PERFIL
        </h1>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          Sua jornada de evolução como atleta profissional
        </p>
      </div>

      {/* Avatar Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(204,26,26,0.15), rgba(204,26,26,0.08))',
        border: '2px solid rgba(204,26,26,0.3)',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center',
        marginBottom: '32px',
        backdropFilter: 'blur(10px)',
      }}>
        {/* Avatar Display */}
        <div style={{
          fontSize: '120px',
          marginBottom: '16px',
          filter: `drop-shadow(0 0 20px ${stage.color})`,
          animation: 'pulse 2s infinite',
        }}>
          {stage.emoji}
        </div>

        <h2 style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '24px',
          fontWeight: 800,
          color: stage.color,
          margin: '0 0 8px 0',
          letterSpacing: '1px',
        }}>
          {stage.name.toUpperCase()}
        </h2>

        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.6)',
          margin: '0 0 24px 0',
        }}>
          Nível {level} • {xp} XP
        </p>

        {/* Level Progress */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            height: '8px',
            background: 'rgba(204,26,26,0.1)',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '8px',
          }}>
            <div style={{
              height: '100%',
              background: `linear-gradient(90deg, ${stage.color}, ${stage.color}dd)`,
              width: `${((xp % 500) / 500) * 100}%`,
              transition: 'width 300ms ease-out',
            }} />
          </div>
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.5)',
            margin: 0,
          }}>
            {500 - (xp % 500)} XP até próximo nível
          </p>
        </div>

        {/* Personalization */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
        }}>
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.6)',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
          }}>
            Personalização
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div>
              <label style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.5)',
                display: 'block',
                marginBottom: '6px',
              }}>
                Tom de Pele
              </label>
              <select
                value={skinTone}
                onChange={(e) => setSkinTone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(204,26,26,0.2)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                <option value="light">Claro</option>
                <option value="medium">Médio</option>
                <option value="dark">Escuro</option>
              </select>
            </div>
            <div>
              <label style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.5)',
                display: 'block',
                marginBottom: '6px',
              }}>
                Cabelo
              </label>
              <select
                value={hair}
                onChange={(e) => setHair(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(204,26,26,0.2)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                <option value="black">Preto</option>
                <option value="brown">Castanho</option>
                <option value="blonde">Louro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div style={{
            background: 'rgba(255,215,0,0.1)',
            border: '1px solid rgba(255,215,0,0.2)',
            borderRadius: '8px',
            padding: '12px',
          }}>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.5)',
              margin: '0 0 4px 0',
            }}>
              XP Total
            </p>
            <p style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '16px',
              fontWeight: 800,
              color: '#FFD700',
              margin: 0,
            }}>
              {xp}
            </p>
          </div>
          <div style={{
            background: 'rgba(255,215,0,0.1)',
            border: '1px solid rgba(255,215,0,0.2)',
            borderRadius: '8px',
            padding: '12px',
          }}>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.5)',
              margin: '0 0 4px 0',
            }}>
              Nadgol Coins
            </p>
            <p style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '16px',
              fontWeight: 800,
              color: '#FFD700',
              margin: 0,
            }}>
              {coins}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { icon: Moon, label: 'Recuperação', value: 85, color: '#00D4FF' },
          { icon: Droplet, label: 'Hidratação', value: 72, color: '#00D4FF' },
          { icon: Zap, label: 'Energia', value: 91, color: '#FFD700' },
          { icon: Brain, label: 'Foco Mental', value: 78, color: '#CC1A1A' },
        ].map((indicator, idx) => {
          const Icon = indicator.icon;
          return (
            <div key={idx} style={{
              background: `linear-gradient(135deg, rgba(${indicator.color === '#00D4FF' ? '0,212,255' : indicator.color === '#FFD700' ? '255,215,0' : '204,26,26'},0.1), rgba(${indicator.color === '#00D4FF' ? '0,212,255' : indicator.color === '#FFD700' ? '255,215,0' : '204,26,26'},0.05))`,
              border: `1px solid rgba(${indicator.color === '#00D4FF' ? '0,212,255' : indicator.color === '#FFD700' ? '255,215,0' : '204,26,26'},0.2)`,
              borderRadius: '12px',
              padding: '16px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Icon size={18} style={{ color: indicator.color }} />
                <p style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.6)',
                  margin: 0,
                }}>
                  {indicator.label}
                </p>
              </div>
              <div style={{
                height: '6px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '8px',
              }}>
                <div style={{
                  height: '100%',
                  background: indicator.color,
                  width: `${indicator.value}%`,
                  transition: 'width 300ms ease-out',
                }} />
              </div>
              <p style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '14px',
                fontWeight: 800,
                color: indicator.color,
                margin: 0,
              }}>
                {indicator.value}%
              </p>
            </div>
          );
        })}
      </div>

      {/* Achievements */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(204,26,26,0.1), rgba(204,26,26,0.05))',
        border: '1px solid rgba(204,26,26,0.2)',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <h3 style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          color: '#fff',
          margin: '0 0 16px 0',
        }}>
          🏅 CONQUISTAS DESBLOQUEADAS
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px' }}>
          {[
            { emoji: '🔥', name: 'Disciplina Elite' },
            { emoji: '💧', name: 'Hidratação Máxima' },
            { emoji: '😴', name: 'Sono Perfeito' },
            { emoji: '⚡', name: 'Atleta Consistente' },
            { emoji: '🏆', name: 'Líder da Semana' },
            { emoji: '🎯', name: 'Foco Total' },
          ].map((achievement, idx) => (
            <div key={idx} style={{
              background: 'rgba(255,215,0,0.1)',
              border: '1px solid rgba(255,215,0,0.2)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,215,0,0.15)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,215,0,0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            >
              <p style={{ fontSize: '24px', margin: '0 0 4px 0' }}>
                {achievement.emoji}
              </p>
              <p style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '9px',
                color: 'rgba(255,255,255,0.7)',
                margin: 0,
              }}>
                {achievement.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* XP Breakdown */}
      <div style={{
        marginTop: '32px',
        background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,212,255,0.05))',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <h3 style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          color: '#00D4FF',
          margin: '0 0 16px 0',
        }}>
          📊 GANHO DE XP ESTA SEMANA
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {[
            { activity: 'Treinos Completos', xp: 800 },
            { activity: 'Partidas Disputadas', xp: 600 },
            { activity: 'Desafios Mind Game', xp: 400 },
            { activity: 'Rotina Profissional', xp: 300 },
            { activity: 'Disciplina Diária', xp: 350 },
          ].map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              background: 'rgba(0,212,255,0.05)',
              borderRadius: '8px',
            }}>
              <p style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '12px',
                color: '#fff',
                margin: 0,
              }}>
                {item.activity}
              </p>
              <p style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '14px',
                fontWeight: 800,
                color: '#00D4FF',
                margin: 0,
              }}>
                +{item.xp} XP
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
