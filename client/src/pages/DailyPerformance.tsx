import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAthletes, useDailyLogs, useSaveDaily } from '@/lib/queries';
import { Plus, TrendingUp, Droplet, Moon, Smartphone, Apple } from 'lucide-react';

const hojeLocal = () => new Date().toLocaleDateString('en-CA');
const REFEICOES = ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar'];

export default function DailyPerformance() {
  const { currentUser, demo } = useApp();
  const atl = useAthletes();
  const lista = (atl.data ?? []).filter(a => a.status === 'active');
  const [atletaId, setAtletaId] = useState('');
  useEffect(() => {
    if (atletaId || lista.length === 0) return;
    setAtletaId(lista.find(a => a.id === currentUser?.atletaId)?.id ?? lista[0].id);
  }, [lista, atletaId, currentUser?.atletaId]);
  const logs = useDailyLogs(atletaId);
  const salvar = useSaveDaily();
  const [sleepHours, setSleepHours] = useState(8);
  const [sleepQuality, setSleepQuality] = useState('elite');
  const [hydration, setHydration] = useState(2.5);
  const [screenTime, setScreenTime] = useState(4.2);
  const [meals, setMeals] = useState<string[]>(['Café da manhã', 'Almoço']);
  const hoje = (logs.data ?? []).find(l => l.data === hojeLocal());
  useEffect(() => {
    if (!hoje) return;
    if (hoje.sono !== null) setSleepHours(hoje.sono);
    if (hoje.agua !== null) setHydration(hoje.agua);
    if (hoje.tela !== null) setScreenTime(hoje.tela);
    if (hoje.refeicoes) setMeals(REFEICOES.slice(0, hoje.refeicoes));
  }, [hoje?.data, hoje?.sono, hoje?.agua, hoje?.tela, hoje?.refeicoes]);
  const semana = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
  const diaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

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

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
        {lista.length > 1 && (
          <select value={atletaId} onChange={e => setAtletaId(e.target.value)} style={{ padding: '8px 12px', background: '#111', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: '12px' }}>
            {lista.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        )}
        <button
          disabled={salvar.isPending || (!demo && !atletaId)}
          onClick={() => salvar.mutate({ atletaId, sono: sleepHours, agua: hydration, tela: screenTime, refeicoes: meals.length })}
          className="nadgol-btn-primary" style={{ padding: '10px 18px', borderRadius: '6px', fontSize: '13px', border: 'none', cursor: 'pointer', opacity: salvar.isPending ? 0.6 : 1 }}
        >
          {salvar.isPending ? 'Salvando...' : 'Salvar o dia de hoje'}
        </button>
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
              📱 Tempo de tela de hoje: {screenTime.toFixed(1)}h
            </p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0 0' }}>
              💡 Limite recomendado: até 5h por dia
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
              {meals.length} {meals.length === 1 ? 'refeição' : 'refeições'}
            </div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: '#22C55E', margin: 0 }}>
              {meals.length >= 4 ? '✓ Rotina completa' : '⚡ Complete mais refeições'}
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
              </div>
            ))}
          </div>
          <button onClick={() => setMeals(m => m.length < REFEICOES.length ? [...m, REFEICOES[m.length]] : m)} style={{
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
          {semana.map((d) => {
            const day = diaSemana[d.getDay()];
            const horas = (logs.data ?? []).find(l => l.data === d.toLocaleDateString('en-CA'))?.sono ?? 0;
            return (
            <div key={d.toISOString()} style={{
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
                  height: `${Math.min(100, (horas / 10) * 100)}%`,
                  background: 'linear-gradient(180deg, #CC1A1A, #991414)',
                  borderRadius: '4px',
                }} />
              </div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: '#CC1A1A', margin: 0, fontWeight: 600 }}>
                {horas ? `${horas}h` : '–'}
              </p>
            </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(204,26,26,0.1)', borderRadius: '12px', border: '1px solid rgba(204,26,26,0.2)' }}>
        <h4 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 600, color: '#CC1A1A', margin: '0 0 12px 0' }}>
          💡 INTELIGÊNCIA ESPORTIVA
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
          {(() => {
            const dias = (logs.data ?? []).filter(l => l.sono !== null);
            const media = dias.length ? dias.reduce((t, l) => t + (l.sono ?? 0), 0) / dias.length : null;
            if (media === null) return <li>Salve o seu dia para ver dicas com base na sua rotina.</li>;
            return (<>
              <li style={{ marginBottom: '8px' }}>Média de sono nos últimos registros: {media.toFixed(1)}h {media >= 8 ? '✓' : '(meta: 8h)'}</li>
              <li>{dias.length} {dias.length === 1 ? 'dia registrado' : 'dias registrados'} nas últimas duas semanas</li>
            </>);
          })()}
        </ul>
      </div>
    </div>
  );
}
