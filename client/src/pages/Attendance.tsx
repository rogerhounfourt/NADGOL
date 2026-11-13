import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAthletes, useClasses, useAttendance, useSaveAttendance, type AttStatus, type AttPerf } from '@/lib/queries';
import { Loading, Empty, ErrorState } from '@/components/PageState';
import { CheckCircle2, XCircle, Clock, Save } from 'lucide-react';

type Status = AttStatus;
type Performance = AttPerf;
const hoje = () => new Date().toLocaleDateString('en-CA');

const PERF_OPTIONS = [
  { key: 'highlight' as Performance, icon: '🔥', label: 'Destaque', color: '#CC1A1A' },
  { key: 'great' as Performance, icon: '⚡', label: 'Muito Bem', color: '#EAB308' },
  { key: 'evolving' as Performance, icon: '📈', label: 'Evoluindo', color: '#22C55E' },
  { key: 'needs_work' as Performance, icon: '🛠', label: 'Precisa Evoluir', color: '#6B7280' },
];

export default function Attendance() {
  const { currentUser } = useApp();
  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'coach';
  const { data: CLASSES = [], isLoading, isError, refetch } = useClasses();
  const { data: ATHLETES = [] } = useAthletes();
  const [chosenClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(hoje);
  const [records, setRecords] = useState<Record<string, { status: Status; performance: Performance }>>({});
  const [dirty, setDirty] = useState(false);

  const cls = CLASSES.find(c => c.id === chosenClass) ?? CLASSES[0];
  const selectedClass = cls?.id ?? '';
  const athletes = cls ? ATHLETES.filter(a => cls.athletes.includes(a.id)) : [];

  // Carrega o que já foi registrado para esta turma nesta data
  const saved = useAttendance(selectedClass, date);
  const save = useSaveAttendance();
  useEffect(() => { setRecords({}); setDirty(false); }, [selectedClass, date]);
  useEffect(() => { if (saved.data) { setRecords(saved.data); setDirty(false); } }, [saved.data]);

  const setStatus = (athleteId: string, status: Status) => {
    if (!canEdit) return;
    setDirty(true);
    setRecords(prev => ({ ...prev, [athleteId]: { status, performance: prev[athleteId]?.performance ?? null } }));
  };
  const setPerf = (athleteId: string, performance: Performance) => {
    if (!canEdit) return;
    setDirty(true);
    setRecords(prev => ({ ...prev, [athleteId]: { status: prev[athleteId]?.status ?? null, performance } }));
  };

  const presentCount = Object.values(records).filter(r => r.status === 'present').length;
  const absentCount = Object.values(records).filter(r => r.status === 'absent').length;
  const lateCount = Object.values(records).filter(r => r.status === 'late').length;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px',
        opacity: 0,
        animation: 'fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0ms forwards',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <img
            src="/escudo-nadgol.svg"
            alt="Nadgol Academy Shield"
            style={{ width: '44px', height: 'auto', filter: 'drop-shadow(0 0 16px rgba(204,26,26,0.3))' }}
          />
          <div>
            <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '32px', color: '#fff', letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1, marginBottom: '4px' }}>
              Lista de Presença
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
              {cls ? `${cls.name} · ${athletes.length} atleta${athletes.length === 1 ? '' : 's'}` : 'Nenhuma turma'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div style={{ padding: '16px', background: '#111111', border: '1px solid #1E1E1E', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Presentes</p>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '28px', fontWeight: 700, color: '#22C55E' }}>{presentCount}</p>
        </div>
        <div style={{ padding: '16px', background: '#111111', border: '1px solid #1E1E1E', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Ausentes</p>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '28px', fontWeight: 700, color: '#EF4444' }}>{absentCount}</p>
        </div>
        <div style={{ padding: '16px', background: '#111111', border: '1px solid #1E1E1E', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Atrasados</p>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '28px', fontWeight: 700, color: '#EAB308' }}>{lateCount}</p>
        </div>
      </div>

      {/* Class Selector */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Selecione a Turma</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CLASSES.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedClass(c.id)}
              style={{
                padding: '10px 16px',
                background: selectedClass === c.id ? '#CC1A1A' : '#111111',
                color: selectedClass === c.id ? '#fff' : 'rgba(255,255,255,0.7)',
                border: `1px solid ${selectedClass === c.id ? '#CC1A1A' : '#1E1E1E'}`,
                borderRadius: '6px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 200ms ease-out',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => {
                if (selectedClass !== c.id) {
                  e.currentTarget.style.borderColor = '#2A2A2A';
                  e.currentTarget.style.background = '#1A1A1A';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedClass !== c.id) {
                  e.currentTarget.style.borderColor = '#1E1E1E';
                  e.currentTarget.style.background = '#111111';
                }
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Data do treino e salvar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Data do treino
          <input type="date" value={date} max={hoje()} onChange={e => e.target.value && setDate(e.target.value)}
            style={{ padding: '9px 12px', background: '#111111', border: '1px solid #1E1E1E', borderRadius: '6px', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', outline: 'none', colorScheme: 'dark' }} />
        </label>
        {canEdit && cls && athletes.length > 0 && (
          <button
            onClick={() => save.mutate({ turmaId: selectedClass, data: date, registros: records }, { onSuccess: () => setDirty(false) })}
            disabled={save.isPending || !dirty}
            className="nadgol-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '6px', fontSize: '13px', border: 'none', cursor: save.isPending || !dirty ? 'default' : 'pointer', opacity: save.isPending || !dirty ? 0.5 : 1 }}
          >
            <Save size={16} /> {save.isPending ? 'Salvando...' : dirty ? 'Salvar presença' : 'Presença salva'}
          </button>
        )}
      </div>

      {(isLoading || saved.isLoading) && <Loading />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && !cls && <Empty title="Nenhuma turma criada" hint="Crie uma turma e vincule atletas para lançar a presença." />}
      {!isLoading && cls && athletes.length === 0 && <Empty title="Turma sem atletas" hint="Vincule atletas a esta turma no cadastro do atleta." />}

      {/* Athletes List */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {athletes.map((athlete, idx) => {
          const record = records[athlete.id] || { status: null, performance: null };
          return (
            <div
              key={athlete.id}
              style={{
                padding: '16px',
                background: '#111111',
                border: '1px solid #1E1E1E',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: 0,
                animation: `fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) ${100 + Math.min(idx, 12) * 30}ms forwards`,
                transition: 'all 200ms ease-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2A2A2A';
                e.currentTarget.style.background = '#1A1A1A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1E1E1E';
                e.currentTarget.style.background = '#111111';
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  {athlete.name}
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                  {athlete.position} · {new Date().getFullYear() - athlete.birthYear} anos
                </p>
              </div>

              {/* Status Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
                <button
                  onClick={() => setStatus(athlete.id, 'present')}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    background: record.status === 'present' ? '#22C55E' : '#1A1A1A',
                    border: `1px solid ${record.status === 'present' ? '#22C55E' : '#2A2A2A'}`,
                    color: record.status === 'present' ? '#fff' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 150ms ease-out',
                    fontSize: '16px',
                  }}
                  title="Presente"
                >
                  ✓
                </button>
                <button
                  onClick={() => setStatus(athlete.id, 'late')}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    background: record.status === 'late' ? '#EAB308' : '#1A1A1A',
                    border: `1px solid ${record.status === 'late' ? '#EAB308' : '#2A2A2A'}`,
                    color: record.status === 'late' ? '#000' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 150ms ease-out',
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                  title="Atrasado"
                >
                  ⏱
                </button>
                <button
                  onClick={() => setStatus(athlete.id, 'absent')}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    background: record.status === 'absent' ? '#EF4444' : '#1A1A1A',
                    border: `1px solid ${record.status === 'absent' ? '#EF4444' : '#2A2A2A'}`,
                    color: record.status === 'absent' ? '#fff' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 150ms ease-out',
                    fontSize: '16px',
                  }}
                  title="Ausente"
                >
                  ✕
                </button>
              </div>

              {/* Performance Evaluation */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {PERF_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setPerf(athlete.id, opt.key)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '6px',
                      background: record.performance === opt.key ? opt.color + '20' : '#1A1A1A',
                      border: `1px solid ${record.performance === opt.key ? opt.color : '#2A2A2A'}`,
                      color: opt.color,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 150ms ease-out',
                      fontSize: '18px',
                      fontWeight: 600,
                    }}
                    title={opt.label}
                  >
                    {opt.icon}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
