import { useEffect, useState } from 'react';
import { useAthletes, usePhysicalEvals } from '@/lib/queries';
import { Loading, Empty, ErrorState } from '@/components/PageState';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const rotulo = (d: string) => `${MES[Number(d.slice(5, 7)) - 1]}/${d.slice(2, 4)}`;
const rotuloLongo = (d: string) => `${MES[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`;

export default function Evolution() {
  const atl = useAthletes();
  const ATHLETES = (atl.data ?? []).filter(a => a.status === 'active');
  const [selectedAthlete, setSelectedAthlete] = useState('');
  useEffect(() => { if (!selectedAthlete && ATHLETES[0]) setSelectedAthlete(ATHLETES[0].id); }, [ATHLETES, selectedAthlete]);
  const medicoes = usePhysicalEvals(selectedAthlete);
  const HISTORY = (medicoes.data ?? []).map(m => ({ month: rotulo(m.data), data: m.data, peso: m.peso ?? 0, altura: m.altura ?? 0, vo2: m.vo2 ?? 0, velocidade: m.velocidade ?? 0 }));

  if (atl.isLoading) return <Loading />;
  if (atl.isError) return <ErrorState onRetry={() => atl.refetch()} />;
  if (ATHLETES.length === 0) return <Empty title="Nenhum atleta" hint="Cadastre atletas para acompanhar a evolução." />;

  const first = HISTORY[0];
  const last = HISTORY[HISTORY.length - 1];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <div style={{ width: '3px', height: '20px', background: '#CC1A1A', borderRadius: '2px' }} />
        <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Evolução do Atleta
        </h2>
      </div>

      {/* Athlete selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {ATHLETES.slice(0, 6).map(a => (
          <button
            key={a.id}
            onClick={() => setSelectedAthlete(a.id)}
            style={{
              padding: '8px 14px',
              background: selectedAthlete === a.id ? '#CC1A1A' : '#111111',
              border: `1px solid ${selectedAthlete === a.id ? '#CC1A1A' : '#2A2A2A'}`,
              borderRadius: '6px',
              color: selectedAthlete === a.id ? '#fff' : 'rgba(255,255,255,0.5)',
              fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: 500,
              cursor: 'pointer', transition: 'all 150ms',
            }}
          >
            {a.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {medicoes.isLoading ? <Loading /> : !first || !last ? <Empty title="Sem medições físicas" hint="Registre medições na tela Performance para ver a evolução." /> : (<>
      {/* Before / After comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {[
          { label: `INÍCIO — ${rotuloLongo(first.data)}`, data: first, color: 'rgba(255,255,255,0.3)' },
          { label: `ATUAL — ${rotuloLongo(last.data)}`, data: last, color: '#CC1A1A' },
        ].map(({ label, data, color }) => (
          <div key={label} className="nadgol-card" style={{ padding: '20px' }}>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '13px', color, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              {label}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Peso', value: `${data.peso} kg` },
                { label: 'Altura', value: `${data.altura} cm` },
                { label: 'VO2 Máx', value: `${data.vo2} ml/kg/min` },
                { label: 'Velocidade', value: `${data.velocidade} km/h` },
              ].map(({ label: l, value }) => (
                <div key={l} style={{ background: '#1A1A1A', borderRadius: '6px', padding: '10px 12px' }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{l}</p>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '18px', color: '#fff' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Improvement badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Peso', diff: last.peso - first.peso, unit: 'kg', positive: false },
          { label: 'Altura', diff: last.altura - first.altura, unit: 'cm', positive: true },
          { label: 'VO2', diff: last.vo2 - first.vo2, unit: 'ml/kg/min', positive: true },
          { label: 'Velocidade', diff: +(last.velocidade - first.velocidade).toFixed(1), unit: 'km/h', positive: true },
        ].map(({ label, diff, unit, positive }) => {
          const isGood = positive ? diff > 0 : diff < 0;
          return (
            <div key={label} className="nadgol-card" style={{ padding: '14px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>{label}</p>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: isGood ? '#22C55E' : '#EF4444', lineHeight: 1 }}>
                {diff > 0 ? '+' : ''}{diff}
              </p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{unit}</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="nadgol-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <TrendingUp size={16} color="#CC1A1A" />
          <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Linha do Tempo
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={HISTORY}>
            <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', fontFamily: 'DM Sans', fontSize: '12px', color: '#fff' }} />
            <Line type="monotone" dataKey="vo2" stroke="#CC1A1A" strokeWidth={2} dot={{ fill: '#CC1A1A', r: 4 }} name="VO2" />
            <Line type="monotone" dataKey="velocidade" stroke="#EAB308" strokeWidth={2} dot={{ fill: '#EAB308', r: 4 }} name="Velocidade" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      </>)}
    </div>
  );
}
