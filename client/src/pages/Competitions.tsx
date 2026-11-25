import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import FormModal from '@/components/FormModal';
import MatchesSection from '@/components/MatchesSection';
import { Loading, Empty, ErrorState } from '@/components/PageState';
import {
  useAthletes, useCompetitions, useCreateCompetition, useEditCompetition, useDeleteCompetition,
  useCompetitionAthletes, useEnrollAthlete, useRemoveEnrollment, useUpdateShirtNumber,
  type CompetitionRow, type InscricaoAtleta,
} from '@/lib/queries';
import { Trophy, Calendar, Users, Plus, Target, Pencil, Trash2, UserPlus, X, Shirt } from 'lucide-react';
import AvatarAtleta from '@/components/AvatarAtleta';

const f = (c = '#fff', s = 13): React.CSSProperties => ({ fontFamily: 'DM Sans, sans-serif', fontSize: `${s}px`, color: c });

/* ─── Modal de inscrição de atletas ──────────────────────────────────── */
function EnrollModal({ comp, onClose }: { comp: CompetitionRow; onClose: () => void }) {
  const atl = useAthletes();
  const inscritos = useCompetitionAthletes(comp.id);
  const inscrever = useEnrollAthlete();
  const remover = useRemoveEnrollment();
  const camisa = useUpdateShirtNumber();
  const [camisas, setCamisas] = useState<Record<string, string>>({});

  const ativos = (atl.data ?? []).filter(a => a.status === 'active');
  const inscritosSet = new Set((inscritos.data ?? []).map(i => i.atleta_id));
  const inscritosMap = Object.fromEntries((inscritos.data ?? []).map(i => [i.atleta_id, i]));

  const setCam = (id: string, v: string) => setCamisas(p => ({ ...p, [id]: v }));

  const salvarCamisa = (atletaId: string) => {
    const val = camisas[atletaId];
    if (val === undefined) return;
    const n = val === '' ? null : Math.max(1, Math.min(99, Math.round(Number(val) || 0)));
    camisa.mutate({ competicaoId: comp.id, atletaId, numero: n });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} />
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', background: '#111', border: '1px solid #2A2A2A', borderRadius: '8px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', animation: 'fadeInUp 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '20px', color: '#fff', textTransform: 'uppercase' }}>Convocação</h2>
            <p style={f('rgba(255,255,255,0.4)', 11)}>{comp.name}</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '16px 20px' }}>
          {atl.isLoading || inscritos.isLoading ? <Loading /> : ativos.length === 0 ? <Empty title="Nenhum atleta ativo" /> : (
            <>
              {/* Inscritos */}
              {(inscritos.data ?? []).length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ ...f('rgba(255,255,255,0.45)', 10), textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Inscritos ({(inscritos.data ?? []).length})</p>
                  {ativos.filter(a => inscritosSet.has(a.id)).map(a => {
                    const insc = inscritosMap[a.id];
                    const camisaVal = camisas[a.id] ?? (insc?.numero_camisa != null ? String(insc.numero_camisa) : '');
                    return (
                      <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #1E1E1E' }}>
                        <AvatarAtleta nome={a.name} foto={a.photo} tamanho={28} />
                        <span style={{ ...f(), flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Shirt size={13} color="rgba(255,255,255,0.3)" />
                          <input
                            type="number" min={1} max={99} placeholder="Nº" inputMode="numeric"
                            value={camisaVal} onChange={e => setCam(a.id, e.target.value)}
                            onBlur={() => salvarCamisa(a.id)}
                            style={{ width: '48px', padding: '5px 4px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '4px', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                          />
                        </div>
                        <button onClick={() => { if (window.confirm(`Remover ${a.name.split(' ')[0]} da convocação?`)) remover.mutate({ competicaoId: comp.id, atletaId: a.id }); }}
                          style={{ background: 'transparent', border: 'none', color: 'rgba(255,60,60,0.6)', cursor: 'pointer', padding: '4px' }}>
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Não inscritos */}
              {ativos.filter(a => !inscritosSet.has(a.id)).length > 0 && (
                <div>
                  <p style={{ ...f('rgba(255,255,255,0.45)', 10), textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Disponíveis</p>
                  {ativos.filter(a => !inscritosSet.has(a.id)).map(a => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #1E1E1E' }}>
                      <AvatarAtleta nome={a.name} foto={a.photo} tamanho={28} />
                      <span style={{ ...f('rgba(255,255,255,0.6)'), flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                      <button onClick={() => inscrever.mutate({ competicaoId: comp.id, atletaId: a.id })}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', color: '#22C55E', ...f('#22C55E', 11), cursor: 'pointer' }}>
                        <UserPlus size={13} /> Convocar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ padding: '0 20px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="nadgol-btn-primary" style={{ padding: '10px 20px', borderRadius: '6px', fontSize: '13px', border: 'none', cursor: 'pointer' }}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Página de Competições ──────────────────────────────────────────── */
export default function Competitions() {
  const { currentUser, demo } = useApp();
  const comps = useCompetitions();
  const atl = useAthletes();
  const create = useCreateCompetition();
  const edit = useEditCompetition();
  const del = useDeleteCompetition();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<CompetitionRow | null>(null);
  const [enrolling, setEnrolling] = useState<CompetitionRow | null>(null);
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
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '18px', color: '#fff', textTransform: 'uppercase', marginBottom: '6px' }}>
                    {comp.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
              </div>

              {/* Atletas inscritos */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {athletes.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1A1A1A', borderRadius: '4px', padding: '5px 10px' }}>
                    <AvatarAtleta nome={a.name} foto={a.photo} tamanho={22} />
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{a.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>

              {/* Ações do card */}
              {podeCriar && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #1E1E1E', paddingTop: '12px' }}>
                  <button onClick={() => setEnrolling(comp)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '5px', ...f('#22C55E', 11), cursor: 'pointer' }}>
                    <UserPlus size={13} /> Convocação
                  </button>
                  <button onClick={() => setEditing(comp)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid #2A2A2A', borderRadius: '5px', ...f('rgba(255,255,255,0.6)', 11), cursor: 'pointer' }}>
                    <Pencil size={13} /> Editar
                  </button>
                  <button onClick={() => { if (window.confirm(`Excluir a competição "${comp.name}"? Os jogos vinculados perderão a referência.`)) del.mutate(comp.id); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'rgba(255,40,40,0.06)', border: '1px solid rgba(255,60,60,0.25)', borderRadius: '5px', ...f('#ff5555', 11), cursor: 'pointer' }}>
                    <Trash2 size={13} /> Excluir
                  </button>
                </div>
              )}
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

      {/* Modal de criar */}
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

      {/* Modal de editar */}
      {editing && (
        <FormModal
          title="Editar competição" submitLabel="Salvar" saving={edit.isPending}
          initial={{ nome: editing.name, data: String(editing.date).slice(0, 10), local: editing.local ?? '', resultado: editing.result ?? '' }}
          fields={[
            { name: 'nome', label: 'Nome', required: true },
            { name: 'data', label: 'Data', type: 'date', required: true, half: true },
            { name: 'local', label: 'Local', half: true },
            { name: 'resultado', label: 'Resultado', placeholder: 'Ex.: Campeão, 2° Lugar...' },
          ]}
          onSubmit={v => edit.mutate({ id: editing.id, nome: v.nome, data: v.data, local: v.local, resultado: v.resultado }, { onSuccess: () => setEditing(null) })}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Modal de convocação */}
      {enrolling && <EnrollModal comp={enrolling} onClose={() => setEnrolling(null)} />}
    </div>
  );
}
