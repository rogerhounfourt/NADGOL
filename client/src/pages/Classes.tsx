import { CLASSES, ATHLETES, getCategory } from '@/lib/data';
import { Users, Clock, MapPin, User, Plus } from 'lucide-react';

export default function Classes() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '3px', height: '20px', background: '#CC1A1A', borderRadius: '2px' }} />
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Controle de Turmas
            </h2>
          </div>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginLeft: '11px' }}>
            {CLASSES.length} turmas ativas
          </p>
        </div>
        <button className="nadgol-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '6px', fontSize: '13px' }}>
          <Plus size={16} /> Nova Turma
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {CLASSES.map((cls, i) => {
          const athletes = ATHLETES.filter(a => cls.athletes.includes(a.id));
          const occupancy = Math.round((athletes.length / cls.maxAthletes) * 100);
          return (
            <div
              key={cls.id}
              className="nadgol-card"
              style={{
                padding: '20px',
                opacity: 0,
                animation: `fadeInUp 0.4s cubic-bezier(0.23, 1, 0.32, 1) ${i * 80}ms forwards`,
              }}
            >
              {/* Class header */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '18px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.2 }}>
                    {cls.name}
                  </h3>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: '#CC1A1A', background: 'rgba(204,26,26,0.12)', border: '1px solid rgba(204,26,26,0.25)', padding: '3px 8px', borderRadius: '4px', flexShrink: 0, marginLeft: '8px' }}>
                    {cls.category}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={13} color="rgba(255,255,255,0.35)" />
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{cls.day} · {cls.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="rgba(255,255,255,0.35)" />
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{cls.unit}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={13} color="rgba(255,255,255,0.35)" />
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{cls.coach}</span>
                  </div>
                </div>
              </div>

              {/* Occupancy bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Ocupação</span>
                  <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '14px', color: occupancy > 80 ? '#EAB308' : '#22C55E' }}>
                    {athletes.length}/{cls.maxAthletes}
                  </span>
                </div>
                <div style={{ height: '4px', background: '#2A2A2A', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${occupancy}%`,
                    background: occupancy > 80 ? '#EAB308' : '#CC1A1A',
                    borderRadius: '2px',
                    transition: 'width 800ms cubic-bezier(0.23, 1, 0.32, 1)',
                  }} />
                </div>
              </div>

              {/* Athletes list */}
              <div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                  Atletas
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {athletes.map(a => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: '#1A1A1A', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #CC1A1A, #991414)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '12px', color: '#fff' }}>
                          {a.name.charAt(0)}
                        </div>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#fff' }}>{a.name}</span>
                      </div>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{a.position}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
