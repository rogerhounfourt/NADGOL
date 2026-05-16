import { ATHLETES, getCategory } from '@/lib/data';
import { Medal, Crown, Star } from 'lucide-react';

export default function Ranking() {
  const sorted = [...ATHLETES].filter(a => a.status === 'active').sort((a, b) => (a.ranking || 99) - (b.ranking || 99));

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <img
          src="/manus-storage/68db7c69-d5fd-4129-8544-30bbc90c29b1_1c2e822c.jpg"
          alt="Nadgol Academy Shield"
          style={{ width: '36px', height: 'auto', filter: 'drop-shadow(0 0 10px rgba(204,26,26,0.2))' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '3px', height: '20px', background: '#CC1A1A', borderRadius: '2px' }} />
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Ranking de Atletas
          </h2>
        </div>
      </div>

      {/* Top 3 podium */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        {[sorted[1], sorted[0], sorted[2]].map((athlete, idx) => {
          if (!athlete) return null;
          const pos = idx === 0 ? 2 : idx === 1 ? 1 : 3;
          const colors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
          const color = colors[pos as 1 | 2 | 3];
          const heights = { 1: '180px', 2: '150px', 3: '130px' };
          const height = heights[pos as 1 | 2 | 3];
          return (
            <div
              key={athlete.id}
              className="nadgol-card"
              style={{
                padding: '20px', textAlign: 'center',
                borderTop: `3px solid ${color}`,
                opacity: 0,
                animation: `fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) ${idx * 100}ms forwards`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${color}44, ${color}22)`,
                    border: `2px solid ${color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff',
                  }}>
                    {athlete.name.charAt(0)}
                  </div>
                  <div style={{
                    position: 'absolute', bottom: '-4px', right: '-4px',
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '12px', color: '#000',
                  }}>
                    {pos}
                  </div>
                </div>
              </div>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '4px' }}>{athlete.name.split(' ')[0]}</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>{getCategory(athlete.birthYear)}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                {[
                  { label: 'Gols', value: athlete.goals ?? 0 },
                  { label: 'Assist.', value: athlete.assists ?? 0 },
                  { label: 'Pres.', value: `${athlete.attendance}%` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: '#1A1A1A', borderRadius: '4px', padding: '6px 4px' }}>
                    <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color, lineHeight: 1 }}>{value}</p>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full ranking list */}
      <div className="nadgol-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Medal size={16} color="#CC1A1A" />
          <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Classificação Geral
          </h3>
        </div>
        <div>
          {sorted.map((athlete, i) => (
            <div
              key={athlete.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 20px',
                borderBottom: i < sorted.length - 1 ? '1px solid #1A1A1A' : 'none',
                background: i === 0 ? 'rgba(255,215,0,0.04)' : 'transparent',
                opacity: 0,
                animation: `fadeInUp 0.4s cubic-bezier(0.23, 1, 0.32, 1) ${i * 40}ms forwards`,
              }}
            >
              <span style={{
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '20px',
                color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'rgba(255,255,255,0.25)',
                width: '28px', textAlign: 'center', flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #CC1A1A, #991414)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', flexShrink: 0 }}>
                {athlete.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '14px', color: '#fff' }}>{athlete.name}</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{athlete.position} · {getCategory(athlete.birthYear)}</p>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                {[
                  { label: 'Gols', value: athlete.goals ?? 0 },
                  { label: 'Assist.', value: athlete.assists ?? 0 },
                  { label: 'Pres.', value: `${athlete.attendance}%` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#CC1A1A', lineHeight: 1 }}>{value}</p>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
