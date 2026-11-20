import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import FormModal from '@/components/FormModal';
import MatchesSection from '@/components/MatchesSection';
import { Loading, Empty, ErrorState } from '@/components/PageState';
import { useAthletes, useCompetitions, useCreateCompetition } from '@/lib/queries';
import { Trophy, Calendar, Users, Plus, Target } from 'lucide-react';

import AvatarAtleta from '@/components/AvatarAtleta';
export default function Competitions() {
  const { currentUser, demo } = useApp();
  const comps = useCompetitions();
  const atl = useAthletes();
  const create = useCreateCompetition();
  const [modal, setModal] = useState(false);
  const ATHLETES = atl.data ?? [];
  const COMPETITIONS = comps.data ?? [];
  const podeCriar = demo || currentUser?.role === 'admin' || currentUser?.role === 'coach';
  const athleteStats = ATHLETES.map(a => ({
    ...a,
    competitions: COMPETITIONS.filter(c => c.athletes.includes(a.id)).length,
  })).filter(a => (a.goals ?? 0) > 0).sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0)).slice(0, 5);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '3px', height: '20px', background: '#CC1A1A', borderRadius: '2px' }} />
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Competições
            </h2>
          </div>
        </div>
        {podeCriar && (
          <button onClick={() => setModal(true)} className="nadgol-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '6px', fontSize: '13px' }}>
            <Plus size={16} /> Nova Competição
          </button>
        )}
      </div>

      {comps.isLoading ? <Loading /> : comps.isError ? <ErrorState onRetry={() => comps.refetch()} /> : COMPETITIONS.length === 0 && <Empty title="Nenhuma competição" hint="Cadastre torneios e campeonatos da escolinha." />}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        {COMPETITIONS.map((comp, i) => {
          const athletes = ATHLETES.filter(a => comp.athletes.includes(a.id));
          return (
            <div
              key={comp.id}
              className="nadgol-card"
              style={{
                padding: '20px',
                borderTop: comp.result?.includes('Campeão') ? '2px solid #FFD700' : '2px solid #CC1A1A',
                opacity: 0,
                animation: `fadeInUp 0.4s cubic-bezier(0.23, 1, 0.32, 1) ${i * 100}ms forwards`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '18px', color: '#fff', textTransform: 'uppercase', marginBottom: '6px' }}>
                    {comp.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} color="rgba(255,255,255,0.35)" />
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        {new Date(`${String(comp.date).slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={13} color="rgba(255,255,255,0.35)" />
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        {comp.athletes.length} atletas
                      </span>
                    </div>
                  </div>
                </div>
                {comp.result ? (
                  <span style={{
                    fontFamily: 'DM Sans, sans-serif', fontSize: '12px',
                    color: comp.result.includes('Campeão') ? '#FFD700' : '#22C55E',
                    background: comp.result.includes('Campeão') ? 'rgba(255,215,0,0.1)' : 'rgba(34,197,94,0.1)',
                    padding: '4px 10px', borderRadius: '4px', whiteSpace: 'nowrap',
                  }}>
                    {comp.result}
                  </span>
                ) : (
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: '#EAB308', background: 'rgba(234,179,8,0.1)', padding: '4px 10px', borderRadius: '4px' }}>
                    Em breve
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {athletes.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1A1A1A', borderRadius: '4px', padding: '5px 10px' }}>
                    <AvatarAtleta nome={a.name} foto={a.photo} tamanho={22} />
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{a.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!demo && <MatchesSection podeEditar={podeCriar} />}

      {/* Top scorers */}
      {athleteStats.length > 0 && <div className="nadgol-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Target size={16} color="#CC1A1A" />
          <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Artilheiros
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {athleteStats.map((a, i) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#1A1A1A', borderRadius: '6px' }}>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '18px', color: 'rgba(255,255,255,0.2)', width: '24px' }}>{i + 1}</span>
              <AvatarAtleta nome={a.name} foto={a.photo} tamanho={34} />
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '13px', color: '#fff' }}>{a.name}</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{a.position}</p>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '20px', color: '#CC1A1A', lineHeight: 1 }}>{a.goals}</p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>Gols</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '20px', color: '#22C55E', lineHeight: 1 }}>{a.assists}</p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>Assist.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>}

      {modal && (
        <FormModal
          title="Nova competição" submitLabel="Criar" saving={create.isPending}
          fields={[
            { name: 'nome', label: 'Nome', required: true, placeholder: 'Ex.: Copa Serrinha Sub-11' },
            { name: 'data', label: 'Data', type: 'date', required: true, half: true },
            { name: 'local', label: 'Local', half: true },
            { name: 'resultado', label: 'Resultado (preencha depois, se ainda não ocorreu)', placeholder: 'Ex.: Campeão' },
            { name: 'convocar', label: 'Atletas convocados', type: 'select', options: [{ value: 'todos', label: 'Todos os atletas ativos' }, { value: 'nenhum', label: 'Ninguém por enquanto' }] },
          ]}
          onSubmit={v => create.mutate({ nome: v.nome, data: v.data, local: v.local, resultado: v.resultado, convocarTodos: v.convocar === 'todos' }, { onSuccess: () => setModal(false) })}
          onClose={() => setModal(false)}
        />
      )}
    </div>
  );
}