import { useState } from 'react';
import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { useAthletes, useClasses, useCreateClass, useUpdateClass, useArchiveClass, useSetClassMember } from '@/lib/queries';
import { getAge, getCategory, type Athlete, type TrainingClass } from '@/lib/data';
import FormModal, { type FormField } from '@/components/FormModal';
import AvatarAtleta from '@/components/AvatarAtleta';
import { Loading, Empty, ErrorState } from '@/components/PageState';
import { Users, Clock, MapPin, User, Plus, ArrowLeft, Pencil, Archive, ClipboardList, UserPlus, X, ChevronRight } from 'lucide-react';

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

const vazio = (s?: string) => (!s || s === '—' ? '' : s);
const rotulo: React.CSSProperties = { fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' };
const texto = (cor = 'rgba(255,255,255,0.5)'): React.CSSProperties => ({ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: cor });

function valoresTurma(t: TrainingClass): Record<string, string> {
  return {
    nome: t.name, categoria: vazio(t.category), maxAtletas: String(t.maxAthletes), diaSemana: vazio(t.day),
    horario: vazio(t.time), treinadorNome: vazio(t.coach), unidadeNome: vazio(t.unit),
  };
}

function Titulo({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <div style={{ width: '3px', height: '20px', background: '#CC1A1A', borderRadius: '2px' }} />
        <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>{children}</h2>
      </div>
      {sub && <p style={{ ...texto('rgba(255,255,255,0.4)'), fontSize: '13px', marginLeft: '11px' }}>{sub}</p>}
    </div>
  );
}

function Barra({ total, max }: { total: number; max: number }) {
  const ocupacao = Math.min(100, Math.round((total / Math.max(1, max)) * 100));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={texto('rgba(255,255,255,0.4)')}>Ocupação</span>
        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '14px', color: ocupacao > 80 ? '#EAB308' : '#22C55E' }}>{total}/{max}</span>
      </div>
      <div style={{ height: '4px', background: '#2A2A2A', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${ocupacao}%`, background: ocupacao > 80 ? '#EAB308' : '#CC1A1A', borderRadius: '2px', transition: 'width 800ms cubic-bezier(0.23, 1, 0.32, 1)' }} />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Tela da turma (abre em /classes/<id>; também abre em outra aba do navegador)
// ----------------------------------------------------------------------------
function TurmaDetalhe({ turma, todos, podeEditarTurma, podeGerirAtletas, onVoltar }: {
  turma: TrainingClass; todos: Athlete[]; podeEditarTurma: boolean; podeGerirAtletas: boolean; onVoltar: () => void;
}) {
  const { setActiveSection } = useApp();
  const update = useUpdateClass();
  const arquivar = useArchiveClass();
  const membro = useSetClassMember();
  const [aba, setAba] = useState<'atletas' | 'dados'>('atletas');
  const [editando, setEditando] = useState(false);
  const [novo, setNovo] = useState('');

  const naTurma = todos.filter(a => turma.athletes.includes(a.id));
  const disponiveis = todos.filter(a => a.status === 'active' && !turma.athletes.includes(a.id));
  const cheia = naTurma.length >= turma.maxAthletes;

  const abaStyle = (ativa: boolean): React.CSSProperties => ({
    padding: '10px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
    color: ativa ? '#fff' : 'rgba(255,255,255,0.45)', fontWeight: ativa ? 600 : 400, borderBottom: `2px solid ${ativa ? '#CC1A1A' : 'transparent'}`,
  });
  const botao: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', border: '1px solid #2A2A2A', background: '#1A1A1A', color: '#fff' };

  return (
    <div style={{ padding: '24px' }}>
      <button onClick={onVoltar} style={{ ...botao, marginBottom: '16px', background: 'transparent' }}><ArrowLeft size={15} /> Turmas</button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div>
          <Titulo>{turma.name}</Titulo>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '10px', marginLeft: '11px' }}>
            <span style={{ ...texto(), display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={13} color="rgba(255,255,255,0.35)" />{turma.day} · {turma.time}</span>
            <span style={{ ...texto(), display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={13} color="rgba(255,255,255,0.35)" />{turma.unit}</span>
            <span style={{ ...texto(), display: 'flex', alignItems: 'center', gap: '6px' }}><User size={13} color="rgba(255,255,255,0.35)" />{turma.coach}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveSection('attendance')} style={botao}><ClipboardList size={15} /> Fazer chamada</button>
          {podeEditarTurma && <button onClick={() => setEditando(true)} className="nadgol-btn-primary" style={{ ...botao, border: 'none' }}><Pencil size={15} /> Editar turma</button>}
        </div>
      </div>

      <div className="nadgol-card" style={{ padding: '16px', marginBottom: '16px' }}><Barra total={naTurma.length} max={turma.maxAthletes} /></div>

      <div style={{ display: 'flex', borderBottom: '1px solid #2A2A2A', marginBottom: '16px' }}>
        <button style={abaStyle(aba === 'atletas')} onClick={() => setAba('atletas')}>Atletas ({naTurma.length})</button>
        <button style={abaStyle(aba === 'dados')} onClick={() => setAba('dados')}>Dados da turma</button>
      </div>

      {aba === 'atletas' && (
        <div>
          {podeGerirAtletas && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <select value={novo} onChange={e => setNovo(e.target.value)} disabled={cheia} style={{ flex: 1, minWidth: '200px', padding: '10px 12px', background: '#111', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', colorScheme: 'dark' }}>
                <option value="">{cheia ? 'Turma cheia' : disponiveis.length ? 'Adicionar atleta à turma…' : 'Todos os atletas já estão nesta turma'}</option>
                {disponiveis.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <button disabled={!novo || cheia || membro.isPending} onClick={() => membro.mutate({ turmaId: turma.id, atletaId: novo, entrar: true }, { onSuccess: () => setNovo('') })}
                className="nadgol-btn-primary" style={{ ...botao, border: 'none', opacity: !novo || cheia ? 0.5 : 1 }}>
                <UserPlus size={15} /> Adicionar
              </button>
            </div>
          )}

          {naTurma.length === 0 && <Empty title="Nenhum atleta nesta turma" hint={podeGerirAtletas ? 'Use o campo acima para adicionar.' : undefined} />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {naTurma.map(a => (
              <div key={a.id} className="nadgol-card" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AvatarAtleta nome={a.name} foto={a.photo} tamanho={40} ativo={a.status === 'active'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '14px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</p>
                  <p style={texto('rgba(255,255,255,0.4)')}>{a.position} · {getCategory(a.birthYear)} · {getAge(a.birthDate)} anos · Presença {a.attendance ?? 0}%</p>
                </div>
                {podeGerirAtletas && (
                  <button aria-label={`Remover ${a.name} da turma`} title="Remover da turma"
                    onClick={() => { if (window.confirm(`Remover ${a.name} desta turma? O cadastro dele continua.`)) membro.mutate({ turmaId: turma.id, atletaId: a.id, entrar: false }); }}
                    style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '6px' }}>
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {aba === 'dados' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {[['Categoria', turma.category], ['Dia', turma.day], ['Horário', turma.time], ['Treinador', turma.coach], ['Unidade', turma.unit], ['Máximo de atletas', String(turma.maxAthletes)]].map(([l, v]) => (
              <div key={l} style={{ background: '#1A1A1A', borderRadius: '6px', padding: '10px 12px' }}>
                <p style={rotulo}>{l}</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '13px', color: '#fff' }}>{v}</p>
              </div>
            ))}
          </div>
          {podeEditarTurma && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #2A2A2A' }}>
              <button onClick={() => { if (window.confirm(`Arquivar a turma "${turma.name}"? Ela some da lista, mas o histórico de presença é mantido.`)) arquivar.mutate(turma.id, { onSuccess: onVoltar }); }}
                disabled={arquivar.isPending} style={{ ...botao, color: '#EF4444', borderColor: 'rgba(239,68,68,0.35)' }}>
                <Archive size={15} /> Arquivar turma
              </button>
              <p style={{ ...texto('rgba(255,255,255,0.35)'), marginTop: '8px' }}>Os atletas continuam cadastrados; só a turma deixa de aparecer.</p>
            </div>
          )}
        </div>
      )}

      {editando && (
        <FormModal
          title="Editar turma" fields={FIELDS} initial={valoresTurma(turma)} submitLabel="Salvar alterações" saving={update.isPending}
          onClose={() => setEditando(false)}
          onSubmit={v => update.mutate({
            id: turma.id, nome: v.nome, categoria: v.categoria, diaSemana: v.diaSemana, horario: v.horario,
            treinadorNome: v.treinadorNome, unidadeNome: v.unidadeNome,
            maxAtletas: v.maxAtletas ? Math.max(1, Math.round(Number(v.maxAtletas))) : undefined,
          }, { onSuccess: () => setEditando(false) })}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Lista de turmas
// ----------------------------------------------------------------------------
export default function Classes() {
  const { currentUser } = useApp();
  const [loc, navigate] = useLocation();
  const { data: CLASSES = [], isLoading, isError, refetch } = useClasses();
  const { data: ATHLETES = [] } = useAthletes();
  const createClass = useCreateClass();
  const [creating, setCreating] = useState(false);
  const isAdmin = currentUser?.role === 'admin';
  const equipe = isAdmin || currentUser?.role === 'coach';

  const turmaId = loc.split('/')[2];
  if (turmaId) {
    const turma = CLASSES.find(c => c.id === turmaId);
    if (isLoading) return <div style={{ padding: '24px' }}><Loading label="Carregando turma..." /></div>;
    if (!turma) return (
      <div style={{ padding: '24px' }}>
        <button onClick={() => navigate('/classes')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', border: '1px solid #2A2A2A', background: 'transparent', color: '#fff', marginBottom: '16px' }}><ArrowLeft size={15} /> Turmas</button>
        <Empty title="Turma não encontrada" hint="Ela pode ter sido arquivada." />
      </div>
    );
    return <TurmaDetalhe turma={turma} todos={ATHLETES} podeEditarTurma={isAdmin} podeGerirAtletas={equipe} onVoltar={() => navigate('/classes')} />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <Titulo sub={`${CLASSES.length} turmas ativas`}>Controle de Turmas</Titulo>
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
          const atletas = ATHLETES.filter(a => cls.athletes.includes(a.id));
          return (
            // É um link de verdade: clique abre a turma; Ctrl/Cmd+clique (ou botão do meio) abre em outra aba do navegador.
            <a
              key={cls.id} href={`/classes/${cls.id}`} className="nadgol-card"
              onClick={e => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; e.preventDefault(); navigate(`/classes/${cls.id}`); }}
              style={{ display: 'block', textDecoration: 'none', color: 'inherit', padding: '20px', cursor: 'pointer', opacity: 0, animation: `fadeInUp 0.4s cubic-bezier(0.23, 1, 0.32, 1) ${Math.min(i, 12) * 80}ms forwards` }}
            >
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '18px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.2 }}>{cls.name}</h3>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: '#CC1A1A', background: 'rgba(204,26,26,0.12)', border: '1px solid rgba(204,26,26,0.25)', padding: '3px 8px', borderRadius: '4px', flexShrink: 0, marginLeft: '8px' }}>{cls.category}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ ...texto(), display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={13} color="rgba(255,255,255,0.35)" />{cls.day} · {cls.time}</span>
                  <span style={{ ...texto(), display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={13} color="rgba(255,255,255,0.35)" />{cls.unit}</span>
                  <span style={{ ...texto(), display: 'flex', alignItems: 'center', gap: '6px' }}><User size={13} color="rgba(255,255,255,0.35)" />{cls.coach}</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}><Barra total={cls.athletes.length} max={cls.maxAthletes} /></div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {atletas.slice(0, 5).map((a, k) => (
                    <div key={a.id} style={{ marginLeft: k ? '-8px' : 0 }}><AvatarAtleta nome={a.name} foto={a.photo} tamanho={30} borda="2px solid #111" /></div>
                  ))}
                  {atletas.length > 5 && <span style={{ ...texto('rgba(255,255,255,0.45)'), marginLeft: '8px' }}>+{atletas.length - 5}</span>}
                  {atletas.length === 0 && <span style={texto('rgba(255,255,255,0.35)')}><Users size={13} style={{ verticalAlign: '-2px' }} /> Sem atletas</span>}
                </div>
                <span style={{ ...texto('#CC1A1A'), display: 'flex', alignItems: 'center', gap: '2px' }}>Abrir turma <ChevronRight size={14} /></span>
              </div>
            </a>
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
