import { useState } from 'react';
import { Plus, TrendingUp, Droplet, Moon, Smartphone, Apple } from 'lucide-react';

export default function DailyPerformance() {
  const [sleepHours, setSleepHours] = useState(8);
  const [sleepQuality, setSleepQuality] = useState('elite');
  const [hydration, setHydration] = useState(2.5);
  const [screenTime, setScreenTime] = useState(4.2);
  const [meals, setMeals] = useState(['Café da manhã', 'Almoço']);

  const getSleepStatus = (hours: number) => {
    if (hours >= 8) return { label: '🏅 Sono Elite', color: '#CC1A1A' };
    if (hours >= 6) return { label: '⚡ Sono Regular', color: '#FFA500' };
    return { label: '⚠️ Sono Insuficiente', color: '#EF4444' };
  };

  const getHydrationStatus = (liters: number) => {
    if (liters >= 3) return { label: '💧 Hidratação Elite', color: '#00D4FF' };
    if (liters >= 2) return { label: '✓ Meta Atingida', color: '#00D4FF' };
    return { label: '⚠️ Abaixo da Meta', color: '#FFA500' };
  };

  return (
    <div style={{ padding: '24px', background: '#0a0a0a', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '32px', fontWeight: 800, color: '#fff', letterSpacing: '2px', margin: 0, marginBottom: '8px' }}>
          PERFORMANCE DIÁRIA
        </h1>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          Monitore sua rotina e evolua como atleta profissional
        </p>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Sleep Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(204,26,26,0.1), rgba(204,26,26,0.05))',
          border: '1px solid rgba(204,26,26,0.2)',
          borderRadius: '12px',
          padding: '24px',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Moon size={24} style={{ color: '#CC1A1A' }} />
            <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 600, color: '#fff', margin: 0 }}>
              SONO
            </h3>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#CC1A1A', marginBottom: '8px' }}>
              {sleepHours}h
            </div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: getSleepStatus(sleepHours).color, margin: 0 }}>
              {getSleepStatus(sleepHours).label}
            </p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '6px' }}>
              Qualidade: {sleepQuality.toUpperCase()}
            </label>
            <select
              value={sleepQuality}
              onChange={(e) => setSleepQuality(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(204,26,26,0.3)',
                borderRadius: '6px',
                color: '#fff',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <option value="elite">Elite</option>
              <option value="regular">Regular</option>
              <option value="ruim">Ruim</option>
            </select>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* Hydration Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,212,255,0.05))',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: '12px',
          padding: '24px',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Droplet size={24} style={{ color: '#00D4FF' }} />
            <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 600, color: '#fff', margin: 0 }}>
              HIDRATAÇÃO
            </h3>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#00D4FF', marginBottom: '8px' }}>
              {hydration.toFixed(1)}L
            </div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: getHydrationStatus(hydration).color, margin: 0 }}>
              {getHydrationStatus(hydration).label}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[200, 300, 500, 1000].map((ml) => (
              <button
                key={ml}
                onClick={() => setHydration(hydration + ml / 1000)}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(0,212,255,0.1)',
                  border: '1px solid rgba(0,212,255,0.3)',
                  borderRadius: '6px',
                  color: '#00D4FF',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,212,255,0.2)';
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,212,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)';
                }}
              >
                +{ml}ml
              </button>
            ))}
          </div>
        </div>

        {/* Screen Time Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,165,0,0.1), rgba(255,165,0,0.05))',
          border: '1px solid rgba(255,165,0,0.2)',
          borderRadius: '12px',
          padding: '24px',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Smartphone size={24} style={{ color: '#FFA500' }} />
            <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 600, color: '#fff', margin: 0 }}>
              TEMPO DE TELA
            </h3>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#FFA500', marginBottom: '8px' }}>
              {screenTime.toFixed(1)}h
            </div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: screenTime > 5 ? '#EF4444' : '#00D4FF', margin: 0 }}>
              {screenTime > 5 ? '⚠️ Acima do recomendado' : '✓ Dentro do limite'}
            </p>
          </div>
          <div style={{ padding: '12px', background: 'rgba(255,165,0,0.1)', borderRadius: '6px', marginBottom: '12px' }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              📱 Redes Sociais: 2.5h
            </p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0 0' }}>
              💡 Modo Foco: Ativado
            </p>
          </div>
          <button style={{
            width: '100%',
            padding: '8px 12px',
            background: 'rgba(255,165,0,0.1)',
            border: '1px solid rgba(255,165,0,0.3)',
            borderRadius: '6px',
            color: '#FFA500',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,165,0,0.2)';
            e.currentTarget.style.borderColor = 'rgba(255,165,0,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,165,0,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,165,0,0.3)';
          }}
          >
            Ativar Modo Foco
          </button>
        </div>

        {/* Nutrition Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '12px',
          padding: '24px',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Apple size={24} style={{ color: '#22C55E' }} />
            <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 600, color: '#fff', margin: 0 }}>
              ALIMENTAÇÃO
            </h3>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#22C55E', marginBottom: '8px' }}>
              2.450 cal
            </div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: '#22C55E', margin: 0 }}>
              ✓ Meta atingida
            </p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            {meals.map((meal, idx) => (
              <div key={idx} style={{
                padding: '8px 12px',
                background: 'rgba(34,197,94,0.1)',
                borderRadius: '6px',
                marginBottom: '6px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '12px',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span>✓ {meal}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>550 cal</span>
              </div>
            ))}
          </div>
          <button style={{
            width: '100%',
            padding: '8px 12px',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '6px',
            color: '#22C55E',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(34,197,94,0.2)';
            e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(34,197,94,0.1)';
            e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)';
          }}
          >
            <Plus size={14} /> Registrar Refeição
          </button>
        </div>
      </div>

      {/* Weekly Chart */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(204,26,26,0.1), rgba(204,26,26,0.05))',
        border: '1px solid rgba(204,26,26,0.2)',
        borderRadius: '12px',
        padding: '24px',
        backdropFilter: 'blur(10px)',
      }}>
        <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 600, color: '#fff', margin: '0 0 16px 0' }}>
          📊 EVOLUÇÃO SEMANAL
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map((day, idx) => (
            <div key={day} style={{
              background: 'rgba(204,26,26,0.1)',
              border: '1px solid rgba(204,26,26,0.2)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px 0' }}>
                {day}
              </p>
              <div style={{
                height: '40px',
                background: 'rgba(204,26,26,0.2)',
                borderRadius: '4px',
                marginBottom: '8px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: `${60 + idx * 10}%`,
                  background: 'linear-gradient(180deg, #CC1A1A, #991414)',
                  borderRadius: '4px',
                }} />
              </div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: '#CC1A1A', margin: 0, fontWeight: 600 }}>
                {(7 + idx * 0.2).toFixed(1)}h
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(204,26,26,0.1)', borderRadius: '12px', border: '1px solid rgba(204,26,26,0.2)' }}>
        <h4 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 600, color: '#CC1A1A', margin: '0 0 12px 0' }}>
          💡 INTELIGÊNCIA ESPORTIVA
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
          <li style={{ marginBottom: '8px' }}>✓ Seu sono melhorou 15% esta semana</li>
          <li style={{ marginBottom: '8px' }}>✓ Sua rotina está mais profissional</li>
          <li style={{ marginBottom: '8px' }}>✓ Você reduziu tempo em redes sociais em 2h</li>
          <li>✓ Seu desempenho cresce quando dorme melhor</li>
        </ul>
      </div>
    </div>
  );
}
