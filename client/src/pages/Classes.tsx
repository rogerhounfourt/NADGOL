import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAthletes, useClasses, useCreateClass } from '@/lib/queries';
import FormModal, { type FormField } from '@/components/FormModal';
import { Loading, Empty, ErrorState } from '@/components/PageState';

const DIAS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
const FIELDS: FormField[] = [
  { name: 'nome', label: 'Nome da turma', required: true, placeholder: 'Sub-13 — Terça 14h' },
  { name: 'categoria', label: 'Categoria', half: true, placeholder: 'Sub-13' },
  { name: 'maxAtletas', label: 'Máximo de atletas', type: 'number', half: true, placeholder: '20' },
  { name: 'diaSemana', label: 'Dia', type: 'select', half: true, options: DIAS.map(d => ({ value: d, label: d })) },
  { name: 'horario', label: 'Horário', type: 'time', half: true },
  { name: 'treinadorNome', label: 'Treinador', half: true },
  { name: 'unidadeNome', label: 'Unidade / local', half: true, placeholder: 'Unidade Centro' },
];
import { Users, Clock, MapPin, User, Plus } from 'lucide-react';

export default function Classes() {
  const { currentUser } = useApp();
  const { data: CLASSES = [], isLoading, isError, refetch } = useClasses();
  const { data: ATHLETES = [] } = useAthletes();
  const createClass = useCreateClass();
  const [creating, setCreating] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

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
        {isAdmin && (
          <button onClick={() => setCreating(true)} className="nadgol-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '6px', fontSize: '13px' }}>
            <Plus size={16} /> Nova Turma
          </button>
        )}
      </div>

      {isLoading && <Loading label="Carregando turmas..." />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && CLASSES.length === 0 && (
        <Empty title="Nenhuma turma criada" hint={isAdmin ? 'Use "Nova Turma" para criar a primeira.' : undefined} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {CLASSES.map((cls, i) => {
          const athletes = ATHLETES.filter(a => cls.athletes.includes(a.id));
          const total = cls.athletes.length;
          const occupancy = Math.min(100, Math.round((total / Math.max(1, cls.maxAthletes)) * 100));
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
                    {total}/{cls.maxAthletes}
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

      {creating && (
        <FormModal
          title="Nova Turma" fields={FIELDS} submitLabel="Criar turma" saving={createClass.isPending}
          onClose={() => setCreating(false)}
          onSubmit={v => createClass.mutate({
            nome: v.nome, categoria: v.categoria, diaSemana: v.diaSemana, horario: v.horario,
            treinadorNome: v.treinadorNome, unidadeNome: v.unidadeNome,
            maxAtletas: v.maxAtletas ? Math.max(1, Math.round(Number(v.maxAtletas))) : undefined,
          }, { onSuccess: () => setCreating(false) })}
        />
      )}
    </div>
  );
}
