import { useEffect, useState } from 'react';
import { Swords, Plus, X } from 'lucide-react';
import FormModal from '@/components/FormModal';
import { Loading, Empty, ErrorState } from '@/components/PageState';
import { useAthletes, useCompetitions, useCreateMatch, useMatches, useMatchStats, useSaveMatchStats, type PartidaRow, type StatsAtleta } from '@/lib/queries';

const f = (c = '#fff', s = 13): React.CSSProperties => ({ fontFamily: 'DM Sans, sans-serif', fontSize: `${s}px`, color: c });
const num: React.CSSProperties = { width: '100%', padding: '8px 6px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', textAlign: 'center', outline: 'none' };
const dataBR = (d: string) => new Date(`${String(d).slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR');

function StatsModal({ partida, onClose }: { partida: PartidaRow; onClose: () => void }) {
  const atl = useAthletes();
  const atual = useMatchStats(partida.id);
  const salvar = useSaveMatchStats();
  const [vals, setVals] = useState<Record<string, { gols: string; assistencias: string; minutos: string; nota: string }>>({});
  const ativos = (atl.data ?? []).filter(a => a.status === 'active');

  useEffect(() => {
    if (!atual.data) return;
    setVals(Object.fromEntries(Object.entries(atual.data).map(([id, s]) => [id, { gols: String(s.gols || ''), assistencias: String(s.assistencias || ''), minutos: String(s.minutos || ''), nota: s.nota === null ? '' : String(s.nota) }])));
  }, [atual.data]);

  const set = (id: string, k: 'gols' | 'assistencias' | 'minutos' | 'nota', v: string) => setVals(p => ({ ...p, [id]: { ...(p[id] ?? { gols: '', assistencias: '', minutos: '', nota: '' }), [k]: v } }));

  const enviar = () => {
    const limitar = (x: string, max: number) => Math.max(0, Math.min(max, Math.round(Number(x) || 0)));
    const stats: Record<string, StatsAtleta> = {};
    for (const a of ativos) {
      const v = vals[a.id]; if (!v) continue;
      const nota = v.nota === '' ? null : Math.max(0, Math.min(10, Math.round(Number(v.nota) * 10) / 10));
      stats[a.id] = { gols: limitar(v.gols, 99), assistencias: limitar(v.assistencias, 99), minutos: limitar(v.minutos, 200), nota };
    }
    salvar.mutate({ partidaId: partida.id, stats }, { onSuccess: onClose });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} />
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', background: '#111', border: '1px solid #2A2A2A', borderRadius: '8px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '20px', color: '#fff', textTransform: 'uppercase' }}>Estatísticas · vs {partida.adversario}</h2>
            <p style={f('rgba(255,255,255,0.4)', 11)}>{dataBR(partida.data)}</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {atual.isLoading || atl.isLoading ? <Loading /> : ativos.length === 0 ? <Empty title="Sem atletas ativos" /> : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 56px 56px 56px', gap: '6px', marginBottom: '6px' }}>
                <span />{['Gols', 'Assist.', 'Min.', 'Nota'].map(h => <span key={h} style={{ ...f('rgba(255,255,255,0.4)', 10), textAlign: 'center', textTransform: 'uppercase' }}>{h}</span>)}
              </div>
              {ativos.map(a => (
                <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr 56px 56px 56px 56px', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ ...f(), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                  {(['gols', 'assistencias', 'minutos', 'nota'] as const).map(k => (
                    <input key={k} type="number" min={0} max={k === 'nota' ? 10 : k === 'minutos' ? 200 : 99} step={k === 'nota' ? 0.1 : 1} inputMode="decimal"
                      aria-label={`${k} de ${a.name}`} value={vals[a.id]?.[k] ?? ''} onChange={e => set(a.id, k, e.target.value)} style={num} />
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
        <div style={{ padding: '0 20px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', ...f('rgba(255,255,255,0.6)'), cursor: 'pointer' }}>Cancelar</button>
          <button onClick={enviar} disabled={salvar.isPending} className="nadgol-btn-primary" style={{ padding: '10px 20px', borderRadius: '6px', fontSize: '13px', border: 'none', cursor: 'pointer', opacity: salvar.isPending ? 0.6 : 1 }}>{salvar.isPending ? 'Salvando...' : 'Salvar estatísticas'}</button>
        </div>
      </div>
    </div>
  );
}

export default function MatchesSection({ podeEditar }: { podeEditar: boolean }) {
  const matches = useMatches();
  const comps = useCompetitions();
  const create = useCreateMatch();
  const [novo, setNovo] = useState(false);
  const [stats, setStats] = useState<PartidaRow | null>(null);

  return (
    <div className="nadgol-card" style={{ padding: '20px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Swords size={16} color="#CC1A1A" /> Jogos
        </h3>
        {podeEditar && <button onClick={() => setNovo(true)} className="nadgol-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', border: 'none', cursor: 'pointer' }}><Plus size={14} /> Registrar jogo</button>}
      </div>

      {matches.isLoading ? <Loading /> : matches.isError ? <ErrorState onRetry={() => matches.refetch()} /> : (matches.data ?? []).length === 0 ? <Empty title="Nenhum jogo registrado" hint="Registre os jogos para alimentar o ranking e os destaques." /> :
        (matches.data ?? []).map(p => {
          const placar = p.placarPro !== null && p.placarContra !== null ? `${p.placarPro} x ${p.placarContra}` : '–';
          const cor = p.placarPro === null || p.placarContra === null ? 'rgba(255,255,255,0.5)' : p.placarPro > p.placarContra ? '#22C55E' : p.placarPro < p.placarContra ? '#EF4444' : '#EAB308';
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: '1px solid #1E1E1E', flexWrap: 'wrap' }}>
              <div>
                <p style={f()}>vs {p.adversario}</p>
                <p style={f('rgba(255,255,255,0.4)', 11)}>{dataBR(p.data)}{p.competicao ? ` · ${p.competicao}` : ''}{p.local ? ` · ${p.local}` : ''} · {p.gols} gols lançados</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '22px', color: cor }}>{placar}</span>
                {podeEditar && <button onClick={() => setStats(p)} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', ...f('rgba(255,255,255,0.7)', 12), cursor: 'pointer' }}>Estatísticas</button>}
              </div>
            </div>
          );
        })}

      {novo && (
        <FormModal
          title="Registrar jogo" submitLabel="Registrar" saving={create.isPending}
          fields={[
            { name: 'adversario', label: 'Adversário', required: true, placeholder: 'Ex.: Escolinha Craques FC' },
            { name: 'data', label: 'Data', type: 'date', required: true, half: true },
            { name: 'local', label: 'Local', half: true },
            { name: 'competicaoId', label: 'Competição (opcional)', type: 'select', options: (comps.data ?? []).map(c => ({ value: c.id, label: c.name })) },
            { name: 'placarPro', label: 'Gols do nosso time', type: 'number', half: true },
            { name: 'placarContra', label: 'Gols do adversário', type: 'number', half: true },
          ]}
          onSubmit={v => create.mutate({ adversario: v.adversario, data: v.data, local: v.local, competicaoId: v.competicaoId, placarPro: v.placarPro, placarContra: v.placarContra }, { onSuccess: () => setNovo(false) })}
          onClose={() => setNovo(false)}
        />
      )}
      {stats && <StatsModal partida={stats} onClose={() => setStats(null)} />}
    </div>
  );
}
