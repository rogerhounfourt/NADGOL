import { useState } from 'react';
import { getCategory, getAge, type Athlete, type TrainingClass, type UserRole } from '@/lib/data';
import { useApp } from '@/contexts/AppContext';
import { useAthletes, useClasses, useUnits, useCreateAthlete, useUpdateAthlete, useAthleteMetrics } from '@/lib/queries';
import AvatarAtleta from '@/components/AvatarAtleta';
import FotoUpload from '@/components/FotoUpload';
import ReportButton from '@/components/ReportButton';
import { relatorioEscola } from '@/lib/relatorios';
import FormModal, { type FormField } from '@/components/FormModal';
import { Loading, Empty, ErrorState } from '@/components/PageState';
import { Search, Plus, ChevronRight, X, Pencil } from 'lucide-react';

const POSITIONS = ['Todos', 'Atacante', 'Meio-Campo', 'Zagueiro', 'Lateral', 'Goleiro'];

function AthleteModal({ athlete, onClose, onEdit }: { athlete: Athlete; onClose: () => void; onEdit?: () => void }) {
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
            <AvatarAtleta nome={athlete.name} foto={athlete.photo} tamanho={64} />
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
              { label: 'Data de Nasc.', value: new Date(`${athlete.birthDate}T12:00:00`).toLocaleDateString('pt-BR') },
              { label: 'Pé Dominante', value: athlete.dominantFoot },
              { label: 'Altura', value: athlete.height ? `${athlete.height} cm` : '—' },
              { label: 'Peso', value: athlete.weight ? `${athlete.weight} kg` : '—' },
              { label: 'Unidade', value: athlete.unit },
              { label: 'Telefone', value: athlete.phone },
              { label: 'Clube que torce', value: athlete.favoriteClub || '—' },
              { label: 'Ranking', value: athlete.ranking ? `#${athlete.ranking}` : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#1A1A1A', borderRadius: '6px', padding: '10px 12px' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{label}</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '13px', color: '#fff' }}>{value}</p>
              </div>
            ))}
          </div>

          {(athlete.goal || athlete.observations) && (
            <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
              {athlete.goal && (
                <div style={{ background: '#1A1A1A', borderRadius: '6px', padding: '10px 12px' }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Objetivo</p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#fff' }}>{athlete.goal}</p>
                </div>
              )}
              {athlete.observations && (
                <div style={{ background: '#1A1A1A', borderRadius: '6px', padding: '10px 12px' }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Observações</p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#fff', whiteSpace: 'pre-wrap' }}>{athlete.observations}</p>
                </div>
              )}
            </div>
          )}

          {athlete.dream && (
            <div style={{ marginTop: '12px', background: 'rgba(204,26,26,0.08)', border: '1px solid rgba(204,26,26,0.2)', borderRadius: '6px', padding: '12px' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: '#CC1A1A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Sonho do Atleta</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: '13px', color: '#fff', fontStyle: 'italic' }}>"{athlete.dream}"</p>
            </div>
          )}

          {onEdit && (
            <button onClick={onEdit} className="nadgol-btn-primary" style={{ marginTop: '16px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px 16px', borderRadius: '6px', fontSize: '13px', border: 'none', cursor: 'pointer' }}>
              <Pencil size={15} /> Editar cadastro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const vazio = (s?: string) => (!s || s === '—' ? '' : s);

/** Cadastro e edição do atleta. Aluno e responsável editam dados pessoais e foto; equipe e administrador editam mais (o banco confere). */
function AtletaForm({ atleta, classes, role, onClose }: { atleta?: Athlete; classes: TrainingClass[]; role: UserRole; onClose: () => void }) {
  const criar = useCreateAthlete();
  const editar = useUpdateAthlete();
  const { data: unidades = [] } = useUnits();
  const [foto, setFoto] = useState<Blob | null | undefined>(undefined);
  const equipe = role === 'admin' || role === 'coach';
  const admin = role === 'admin';
  const editando = !!atleta;

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome completo', required: true },
    { name: 'dataNascimento', label: 'Data de nascimento', type: 'date', required: true, half: true },
    { name: 'posicao', label: 'Posição', type: 'select', half: true, options: POSITIONS.slice(1).map(v => ({ value: v, label: v })) },
    { name: 'peDominante', label: 'Pé dominante', type: 'select', half: true, options: ['Direito', 'Esquerdo', 'Ambos'].map(v => ({ value: v, label: v })) },
    ...(equipe ? [
      { name: 'turmaId', label: 'Turma', type: 'select' as const, half: true, options: classes.map(c => ({ value: c.id, label: c.name })) },
      { name: 'unidadeId', label: 'Unidade', type: 'select' as const, half: true, options: unidades.map(u => ({ value: u.id, label: u.nome })) },
    ] : []),
    { name: 'alturaCm', label: 'Altura (cm)', type: 'number', half: true, placeholder: '170' },
    { name: 'pesoKg', label: 'Peso (kg)', type: 'number', half: true },
    { name: 'telefone', label: 'Telefone do responsável', type: 'tel', half: true, placeholder: '(00) 00000-0000' },
    { name: 'clubeFavorito', label: 'Clube que torce', half: true },
    ...(equipe && editando ? [{ name: 'status', label: 'Situação', type: 'select' as const, half: true, options: [{ value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }, { value: 'trancado', label: 'Trancado' }, { value: 'em_clube', label: 'Em clube' }] }] : []),
    ...(admin ? [
      { name: 'valorMensalidade', label: 'Mensalidade (R$)', type: 'number' as const, half: true },
      { name: 'diaVencimento', label: 'Dia do vencimento (1-28)', type: 'number' as const, half: true },
    ] : []),
    { name: 'sonho', label: 'Sonho do atleta' },
    { name: 'objetivo', label: 'Objetivo' },
    { name: 'observacoes', label: 'Observações', type: 'textarea' },
  ];

  const initial: Record<string, string> | undefined = atleta ? {
    nome: atleta.name, dataNascimento: atleta.birthDate, posicao: vazio(atleta.position), peDominante: atleta.dominantFoot,
    turmaId: atleta.classId, unidadeId: atleta.unitId ?? '', alturaCm: atleta.height ? String(atleta.height) : '', pesoKg: atleta.weight ? String(atleta.weight) : '',
    telefone: vazio(atleta.phone), clubeFavorito: vazio(atleta.favoriteClub), status: ({ active: 'ativo', inactive: 'inativo', locked: 'trancado', at_club: 'em_clube' } as Record<string,string>)[atleta.status] ?? 'inativo',
    valorMensalidade: atleta.monthlyFee != null ? String(atleta.monthlyFee) : '', diaVencimento: atleta.dueDay != null ? String(atleta.dueDay) : '',
    sonho: vazio(atleta.dream), objetivo: vazio(atleta.goal), observacoes: vazio(atleta.observations),
  } : undefined;

  const num = (s?: string) => (s ? Number(s) : undefined);
  // Quem digita 1,70 (metros) no campo de centímetros: converte para 170.
  const altura = (s?: string) => { const n = num(s); return n !== undefined && n > 0 && n < 3 ? Math.round(n * 100) : n; };
  const dia = (s?: string) => (s ? Math.min(28, Math.max(1, Math.round(Number(s)))) : undefined);

  return (
    <FormModal
      title={editando ? 'Editar cadastro' : 'Novo Atleta'} fields={fields} initial={initial}
      submitLabel={editando ? 'Salvar alterações' : 'Cadastrar'} saving={criar.isPending || editar.isPending}
      topSlot={<FotoUpload nome={atleta?.name ?? ''} atual={atleta?.photo} value={foto} onChange={setFoto} />}
      onClose={onClose}
      onSubmit={v => {
        if (!atleta) {
          criar.mutate({
            nome: v.nome, dataNascimento: v.dataNascimento, posicao: v.posicao, peDominante: v.peDominante, turmaId: v.turmaId,
            alturaCm: altura(v.alturaCm), pesoKg: num(v.pesoKg), telefone: v.telefone, clubeFavorito: v.clubeFavorito, sonho: v.sonho,
            unidadeId: v.unidadeId || undefined, objetivo: v.objetivo, observacoes: v.observacoes, valorMensalidade: num(v.valorMensalidade), diaVencimento: dia(v.diaVencimento),
            foto: foto instanceof Blob ? foto : undefined,
          }, { onSuccess: onClose });
          return;
        }
        editar.mutate({
          id: atleta.id, nome: v.nome, dataNascimento: v.dataNascimento, posicao: v.posicao, peDominante: v.peDominante,
          alturaCm: altura(v.alturaCm) ?? null, pesoKg: num(v.pesoKg) ?? null, telefone: v.telefone, clubeFavorito: v.clubeFavorito,
          sonho: v.sonho, objetivo: v.objetivo, observacoes: v.observacoes,
          ...(equipe ? { status: (v.status || undefined) as 'ativo' | 'inativo' | 'trancado' | 'em_clube' | undefined, unidadeId: v.unidadeId ?? '', turmaId: v.turmaId ?? '', turmaAnteriorId: atleta.classId } : {}),
          ...(admin ? { valorMensalidade: num(v.valorMensalidade) ?? null, diaVencimento: dia(v.diaVencimento) ?? null } : {}),
          foto, fotoAtual: atleta.photo,
        }, { onSuccess: onClose });
      }}
    />
  );
}

export default function Athletes() {
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('Todos');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { currentUser } = useApp();
  const { data: athletes = [], isLoading, isError, refetch } = useAthletes();
  const { data: classes = [] } = useClasses();
  const metricas = useAthleteMetrics();
  const role = currentUser?.role ?? 'athlete';
  const canEdit = role === 'admin' || role === 'coach';
  // Aluno e responsável só enxergam o(s) próprio(s) cadastro(s) (regra do banco), então podem editar o que aparece.
  const podeEditarCadastro = canEdit || role === 'parent' || role === 'athlete';
  const selected = athletes.find(a => a.id === selectedId) ?? null;
  const editing = athletes.find(a => a.id === editingId) ?? null;

  const filtered = athletes.filter(a => {
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
              src="/escudo-nadgol.svg"
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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {(currentUser?.role === 'admin' || currentUser?.role === 'coach') && (
          <ReportButton label="Relatório PDF" disabled={!metricas.data?.length} onClick={() => relatorioEscola({ escola: currentUser?.escolaNome ?? 'Nadgol Academy', atletas: metricas.data ?? [] })} />
        )}
        {canEdit && (
          <button onClick={() => setCreating(true)} className="nadgol-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '6px', fontSize: '13px' }}>
            <Plus size={16} /> Novo Atleta
          </button>
        )}
        </div>
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

      {isLoading && <Loading label="Carregando atletas..." />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {!isLoading && !isError && filtered.length === 0 && (
        <Empty title={athletes.length ? 'Nenhum atleta nesse filtro' : 'Nenhum atleta cadastrado'} hint={athletes.length ? 'Ajuste a busca ou a posição.' : canEdit ? 'Use "Novo Atleta" para cadastrar o primeiro.' : undefined} />
      )}

      {/* Athletes grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
        {filtered.map((athlete, i) => (
          <div
            key={athlete.id}
            className="nadgol-card"
            style={{
              padding: '16px', cursor: 'pointer',
              opacity: 0,
              animation: `fadeInUp 0.4s cubic-bezier(0.23, 1, 0.32, 1) ${Math.min(i, 12) * 50}ms forwards`,
            }}
            onClick={() => setSelectedId(athlete.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <AvatarAtleta nome={athlete.name} foto={athlete.photo} tamanho={44} ativo={athlete.status === 'active'} />
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
              {(() => {
                const st = { active: { l: 'Ativo', c: '#22C55E', b: 'rgba(34,197,94,0.1)' }, inactive: { l: 'Inativo', c: '#EF4444', b: 'rgba(239,68,68,0.1)' }, locked: { l: 'Trancado', c: '#F59E0B', b: 'rgba(245,158,11,0.1)' }, at_club: { l: 'Em clube', c: '#3B82F6', b: 'rgba(59,130,246,0.1)' } }[athlete.status] ?? { l: athlete.status, c: '#888', b: 'rgba(136,136,136,0.1)' };
                return <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: st.c, background: st.b, padding: '2px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {athlete.status === 'at_club' && athlete.clubeAtualEscudo && <img src={athlete.clubeAtualEscudo} alt="" style={{ width: 14, height: 14, borderRadius: 2, objectFit: 'contain' }} />}
                  {st.l}
                </span>;
              })()}
            </div>
          </div>
        ))}
      </div>

      {selected && !editing && (
        <AthleteModal athlete={selected} onClose={() => setSelectedId(null)} onEdit={podeEditarCadastro ? () => setEditingId(selected.id) : undefined} />
      )}
      {creating && <AtletaForm classes={classes} role={role} onClose={() => setCreating(false)} />}
      {editing && <AtletaForm atleta={editing} classes={classes} role={role} onClose={() => setEditingId(null)} />}
    </div>
  );
}
