import { useState } from 'react';
import { ATHLETES, PERFORMANCE, getCategory } from '@/lib/data';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { Activity, TrendingUp } from 'lucide-react';

const PERF_HISTORY = [
  { month: 'Jan', peso: 55, altura: 162, vo2: 46, velocidade: 26.5, resistencia: 76 },
  { month: 'Fev', peso: 56, altura: 163, vo2: 48, velocidade: 27.0, resistencia: 79 },
  { month: 'Mar', peso: 56, altura: 163, vo2: 49, velocidade: 27.2, resistencia: 81 },
  { month: 'Abr', peso: 57, altura: 164, vo2: 50, velocidade: 27.8, resistencia: 82 },
  { month: 'Mai', peso: 58, altura: 165, vo2: 52, velocidade: 28.5, resistencia: 85 },
];

const RADAR_DATA = [
  { subject: 'Velocidade', A: 88 },
  { subject: 'Resistência', A: 85 },
  { subject: 'Técnica', A: 92 },
  { subject: 'Físico', A: 80 },
  { subject: 'Tático', A: 75 },
  { subject: 'Mental', A: 90 },
];

export default function Performance() {
  const [selectedAthlete, setSelectedAthlete] = useState(ATHLETES[0].id);
  const athlete = ATHLETES.find(a => a.id === selectedAthlete)!;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <div style={{ width: '3px', height: '20px', background: '#CC1A1A', borderRadius: '2px' }} />
        <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Controle de Performance
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

      {/* Athlete header */}
      <div className="nadgol-card nadgol-card-active" style={{ padding: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #CC1A1A, #991414)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff' }}>
          {athlete.name.charAt(0)}
        </div>
        <div>
          <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '22px', color: '#fff', textTransform: 'uppercase' }}>{athlete.name}</h3>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{athlete.position} · {getCategory(athlete.birthYear)}</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: '20px' }}>
          {[
            { label: 'Peso', value: `${athlete.weight}kg` },
            { label: 'Altura', value: `${athlete.height}cm` },
            { label: 'VO2', value: '52' },
            { label: 'Velocidade', value: '28.5km/h' },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '22px', color: '#CC1A1A', lineHeight: 1 }}>{value}</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        {/* Evolution chart */}
        <div className="nadgol-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp size={16} color="#CC1A1A" />
            <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Evolução Física
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={PERF_HISTORY}>
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', fontFamily: 'DM Sans', fontSize: '12px', color: '#fff' }} />
              <Line type="monotone" dataKey="vo2" stroke="#CC1A1A" strokeWidth={2} dot={{ fill: '#CC1A1A', r: 4 }} name="VO2" />
              <Line type="monotone" dataKey="resistencia" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E', r: 4 }} name="Resistência" />
              <Line type="monotone" dataKey="velocidade" stroke="#EAB308" strokeWidth={2} dot={{ fill: '#EAB308', r: 4 }} name="Velocidade" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="nadgol-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Activity size={16} color="#CC1A1A" />
            <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Perfil Atlético
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="#2A2A2A" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'DM Sans' }} />
              <Radar dataKey="A" stroke="#CC1A1A" fill="#CC1A1A" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
