import { useState } from 'react';
import { ATHLETES, CLASSES, getCategory } from '@/lib/data';
import { CheckCircle2, XCircle, Clock, Flame, Zap, TrendingUp, Wrench } from 'lucide-react';

type Status = 'present' | 'absent' | 'late' | null;
type Performance = 'highlight' | 'great' | 'evolving' | 'needs_work' | null;

const PERF_OPTIONS = [
  { key: 'highlight' as Performance, icon: '🔥', label: 'Destaque', color: '#CC1A1A' },
  { key: 'great' as Performance, icon: '⚡', label: 'Muito Bem', color: '#EAB308' },
  { key: 'evolving' as Performance, icon: '📈', label: 'Evoluindo', color: '#22C55E' },
  { key: 'needs_work' as Performance, icon: '🛠', label: 'Precisa Evoluir', color: '#6B7280' },
];

export default function Attendance() {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0].id);
  const [records, setRecords] = useState<Record<string, { status: Status; performance: Performance }>>({});

  const cls = CLASSES.find(c => c.id === selectedClass)!;
  const athletes = ATHLETES.filter(a => cls.athletes.includes(a.id));

  const setStatus = (athleteId: string, status: Status) => {
    setRecords(prev => ({ ...prev, [athleteId]: { ...prev[athleteId], status } }));
  };
  const setPerf = (athleteId: string, performance: Performance) => {
    setRecords(prev => ({ ...prev, [athleteId]: { ...prev[athleteId], performance } }));
  };

  const presentCount = Object.values(records).filter(r => r.status === 'present').length;
  const absentCount = Object.values(records).filter(r => r.status === 'absent').length;
  const lateCount = Object.values(records).filter(r => r.status === 'late').length;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <div style={{ width: '3px', height: '20px', background: '#CC1A1A', borderRadius: '2px' }} />
        <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Lista de Presença
        </h2>
      </div>

      {/* Class selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {CLASSES.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedClass(c.id)}
            style={{
              padding: '8px 14px',
              background: selectedClass === c.id ? '#CC1A1A' : '#111111',
              border: `1px solid ${selectedClass === c.id ? '#CC1A1A' : '#2A2A2A'}`,
              borderRadius: '6px',
              color: selectedClass === c.id ? '#fff' : 'rgba(255,255,255,0.5)',
              fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: 500,
              cursor: 'pointer', transition: 'all 150ms',
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Presentes', value: presentCount, color: '#22C55E' },
          { label: 'Ausentes', value: absentCount, color: '#EF4444' },
          { label: 'Atrasados', value: lateCount, color: '#EAB308' },
        ].map(({ label, value, color }) => (
          <div key={label} className="nadgol-card" style={{ padding: '14px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '32px', color, lineHeight: 1 }}>{value}</p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Athletes list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {athletes.map((athlete, i) => {
          const rec = records[athlete.id] || { status: null, performance: null };
          return (
            <div
              key={athlete.id}
              className="nadgol-card"
              style={{
                padding: '14px 16px',
                opacity: 0,
                animation: `fadeInUp 0.4s cubic-bezier(0.23, 1, 0.32, 1) ${i * 60}ms forwards`,
                borderLeft: rec.status === 'present' ? '2px solid #22C55E' : rec.status === 'absent' ? '2px solid #EF4444' : rec.status === 'late' ? '2px solid #EAB308' : '2px solid transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* Avatar */}
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #CC1A1A, #991414)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '18px', color: '#fff', flexShrink: 0 }}>
                  {athlete.name.charAt(0)}
                </div>

                {/* Name */}
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '14px', color: '#fff' }}>{athlete.name}</p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{athlete.position} · {getCategory(athlete.birthYear)}</p>
                </div>

                {/* Status buttons */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { status: 'present' as Status, icon: CheckCircle2, color: '#22C55E', label: 'P' },
                    { status: 'absent' as Status, icon: XCircle, color: '#EF4444', label: 'F' },
                    { status: 'late' as Status, icon: Clock, color: '#EAB308', label: 'A' },
                  ].map(({ status, icon: Icon, color, label }) => (
                    <button
                      key={status}
                      onClick={() => setStatus(athlete.id, rec.status === status ? null : status)}
                      style={{
                        width: '36px', height: '36px',
                        borderRadius: '6px',
                        background: rec.status === status ? `${color}22` : '#1A1A1A',
                        border: `1px solid ${rec.status === status ? color : '#2A2A2A'}`,
                        color: rec.status === status ? color : 'rgba(255,255,255,0.3)',
                        cursor: 'pointer', transition: 'all 150ms',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Icon size={16} />
                    </button>
                  ))}
                </div>

                {/* Performance */}
                {rec.status === 'present' && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {PERF_OPTIONS.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setPerf(athlete.id, rec.performance === opt.key ? null : opt.key)}
                        title={opt.label}
                        style={{
                          width: '32px', height: '32px',
                          borderRadius: '6px',
                          background: rec.performance === opt.key ? `${opt.color}22` : '#1A1A1A',
                          border: `1px solid ${rec.performance === opt.key ? opt.color : '#2A2A2A'}`,
                          cursor: 'pointer', transition: 'all 150ms',
                          fontSize: '14px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {opt.icon}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="nadgol-btn-primary"
          style={{ padding: '12px 28px', borderRadius: '6px', fontSize: '14px', letterSpacing: '1px' }}
        >
          SALVAR PRESENÇA
        </button>
      </div>
    </div>
  );
}
