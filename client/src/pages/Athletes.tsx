import { useState } from 'react';
import { ATHLETES, getCategory, getAge, Athlete } from '@/lib/data';
import { Search, Plus, Filter, ChevronRight, X } from 'lucide-react';

const POSITIONS = ['Todos', 'Atacante', 'Meio-Campo', 'Zagueiro', 'Lateral', 'Goleiro'];

function AthleteModal({ athlete, onClose }: { athlete: Athlete; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} />
      <div
        style={{
          position: 'relative', zIndex: 1,
          background: '#111111', border: '1px solid #2A2A2A', borderRadius: '8px',
          width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
          animation: 'fadeInUp 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #CC1A1A, #991414)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff',
            }}>
              {athlete.name.charAt(0)}
            </div>
            <div>
              <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '22px', color: '#fff', textTransform: 'uppercase' }}>
                {athlete.name}
              </h2>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: '#CC1A1A' }}>
                {athlete.position} · {getCategory(athlete.birthYear)} · {getAge(athlete.birthDate)} anos
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', background: '#2A2A2A', borderBottom: '1px solid #2A2A2A' }}>
          {[
            { label: 'Gols', value: athlete.goals ?? 0 },
            { label: 'Assistências', value: athlete.assists ?? 0 },
            { label: 'Presença', value: `${athlete.attendance ?? 0}%` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#111111', padding: '16px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '28px', color: '#CC1A1A', lineHeight: 1 }}>{value}</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Details */}
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Data de Nasc.', value: new Date(athlete.birthDate).toLocaleDateString('pt-BR') },
              { label: 'Pé Dominante', value: athlete.dominantFoot },
              { label: 'Altura', value: `${athlete.height} cm` },
              { label: 'Peso', value: `${athlete.weight} kg` },
              { label: 'Unidade', value: athlete.unit },
              { label: 'Telefone', value: athlete.phone },
              { label: 'Clube que torce', value: athlete.favoriteClub || '—' },
              { label: 'Ranking', value: `#${athlete.ranking}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#1A1A1A', borderRadius: '6px', padding: '10px 12px' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{label}</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '13px', color: '#fff' }}>{value}</p>
              </div>
            ))}
          </div>

          {athlete.dream && (
            <div style={{ marginTop: '12px', background: 'rgba(204,26,26,0.08)', border: '1px solid rgba(204,26,26,0.2)', borderRadius: '6px', padding: '12px' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: '#CC1A1A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Sonho do Atleta</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: '13px', color: '#fff', fontStyle: 'italic' }}>"{athlete.dream}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Athletes() {
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('Todos');
  const [selected, setSelected] = useState<Athlete | null>(null);

  const filtered = ATHLETES.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchPos = posFilter === 'Todos' || a.position === posFilter;
    return matchSearch && matchPos;
  });

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <img
              src="/manus-storage/68db7c69-d5fd-4129-8544-30bbc90c29b1_1c2e822c.jpg"
              alt="Nadgol Academy Shield"
              style={{ width: '36px', height: 'auto', filter: 'drop-shadow(0 0 10px rgba(204,26,26,0.2))' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '3px', height: '20px', background: '#CC1A1A', borderRadius: '2px' }} />
              <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Atletas Cadastrados
              </h2>
            </div>
          </div>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginLeft: '11px' }}>
            {filtered.length} atleta{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="nadgol-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '6px', fontSize: '13px' }}>
          <Plus size={16} /> Novo Atleta
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar atleta..."
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              background: '#111111', border: '1px solid #2A2A2A', borderRadius: '6px',
              color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {POSITIONS.map(pos => (
            <button
              key={pos}
              onClick={() => setPosFilter(pos)}
              style={{
                padding: '8px 14px',
                background: posFilter === pos ? '#CC1A1A' : '#111111',
                border: `1px solid ${posFilter === pos ? '#CC1A1A' : '#2A2A2A'}`,
                borderRadius: '6px',
                color: posFilter === pos ? '#fff' : 'rgba(255,255,255,0.5)',
                fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: 500,
                cursor: 'pointer', transition: 'all 150ms',
              }}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Athletes grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
        {filtered.map((athlete, i) => (
          <div
            key={athlete.id}
            className="nadgol-card"
            style={{
              padding: '16px', cursor: 'pointer',
              opacity: 0,
              animation: `fadeInUp 0.4s cubic-bezier(0.23, 1, 0.32, 1) ${i * 50}ms forwards`,
            }}
            onClick={() => setSelected(athlete)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: athlete.status === 'active' ? 'linear-gradient(135deg, #CC1A1A, #991414)' : '#2A2A2A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '20px', color: '#fff',
                flexShrink: 0,
              }}>
                {athlete.name.charAt(0)}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '14px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {athlete.name}
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                  {athlete.position} · {getCategory(athlete.birthYear)}
                </p>
              </div>
              <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              {[
                { label: 'Gols', value: athlete.goals ?? 0 },
                { label: 'Assist.', value: athlete.assists ?? 0 },
                { label: 'Pres.', value: `${athlete.attendance ?? 0}%` },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: '#1A1A1A', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#CC1A1A', lineHeight: 1 }}>{value}</p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{label}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{athlete.unit}</span>
              <span style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: '11px',
                color: athlete.status === 'active' ? '#22C55E' : '#EF4444',
                background: athlete.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                padding: '2px 8px', borderRadius: '4px',
              }}>
                {athlete.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {selected && <AthleteModal athlete={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
