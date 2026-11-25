import { useState } from 'react';
import { toast } from 'sonner';
import { UserPlus, Check, X, Clock, Phone, Mail, MapPin, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Loading, Empty, ErrorState } from '@/components/PageState';
import { usePreMatriculas, useUpdatePreMatricula, type PreMatricula } from '@/lib/queries';

const txt = (c = '#fff', s = 13): React.CSSProperties => ({ fontFamily: 'DM Sans, sans-serif', fontSize: `${s}px`, color: c });
const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', border: 'none' };

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  pendente: { bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.3)', text: '#EAB308', label: 'Pendente' },
  aprovada: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.3)', text: '#22C55E', label: 'Aprovada' },
  rejeitada: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', text: '#EF4444', label: 'Rejeitada' },
};

function Badge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.pendente;
  return <span style={{ ...txt(s.text, 10), background: s.bg, border: `1px solid ${s.border}`, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{s.label}</span>;
}

function idade(dn: string): string {
  const d = new Date(dn);
  const hoje = new Date();
  let a = hoje.getFullYear() - d.getFullYear();
  if (hoje.getMonth() < d.getMonth() || (hoje.getMonth() === d.getMonth() && hoje.getDate() < d.getDate())) a--;
  return `${a} anos`;
}

function Card({ pm, onAprovar, onRejeitar }: { pm: PreMatricula; onAprovar: () => void; onRejeitar: (motivo: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [motivo, setMotivo] = useState('');

  return (
    <div className="nadgol-card" style={{ padding: '16px 20px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ ...txt('#fff', 15), fontWeight: 600 }}>{pm.nome_atleta}</span>
            <Badge status={pm.status} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', ...txt('#888', 12) }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CalendarDays size={12} /> {new Date(pm.data_nascimento).toLocaleDateString('pt-BR')} ({idade(pm.data_nascimento)})</span>
            <span>{pm.sexo === 'M' ? '♂ Masc' : '♀ Fem'}</span>
            {pm.posicao && <span>⚽ {pm.posicao}</span>}
            {pm.pe_dominante && <span>🦶 {pm.pe_dominante}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {pm.status === 'pendente' && (
            <>
              <button onClick={onAprovar} style={{ ...btn, background: '#22C55E20', color: '#22C55E', border: '1px solid #22C55E40' }}><Check size={14} /> Aprovar</button>
              <button onClick={() => setShowReject(true)} style={{ ...btn, background: '#EF444420', color: '#EF4444', border: '1px solid #EF444440' }}><X size={14} /> Rejeitar</button>
            </>
          )}
          <button onClick={() => setExpanded(!expanded)} style={{ ...btn, background: 'transparent', color: '#888', border: '1px solid #2A2A2A' }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #1E1E1E', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <p style={{ ...txt('#666', 11), textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Responsável</p>
            <p style={txt('#ddd', 13)}>{pm.nome_responsavel}</p>
            {pm.parentesco && <p style={txt('#888', 12)}>{pm.parentesco}</p>}
          </div>
          <div>
            <p style={{ ...txt('#666', 11), textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Contato</p>
            <p style={{ ...txt('#ddd', 12), display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {pm.telefone_responsavel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}</p>
            {pm.email_responsavel && <p style={{ ...txt('#888', 12), display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {pm.email_responsavel}</p>}
          </div>
          <div>
            <p style={{ ...txt('#666', 11), textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Localização</p>
            <p style={{ ...txt('#ddd', 12), display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {[pm.bairro, pm.cidade].filter(Boolean).join(', ') || '—'}</p>
          </div>
          {pm.como_conheceu && (
            <div>
              <p style={{ ...txt('#666', 11), textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Como conheceu</p>
              <p style={txt('#ddd', 12)}>{pm.como_conheceu}</p>
            </div>
          )}
          {pm.observacoes && (
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ ...txt('#666', 11), textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Observações</p>
              <p style={txt('#ddd', 12)}>{pm.observacoes}</p>
            </div>
          )}
          <div>
            <p style={{ ...txt('#666', 11), textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Enviado em</p>
            <p style={txt('#ddd', 12)}>{new Date(pm.criado_em).toLocaleString('pt-BR')}</p>
          </div>
          {pm.status === 'rejeitada' && pm.motivo_rejeicao && (
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ ...txt('#EF4444', 11), textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Motivo da rejeição</p>
              <p style={txt('#EF4444', 12)}>{pm.motivo_rejeicao}</p>
            </div>
          )}
        </div>
      )}

      {showReject && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #1E1E1E', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input type="text" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Motivo da rejeição (opcional)" style={{ flex: 1, minWidth: '200px', padding: '8px 12px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#E0E0E0', fontSize: '13px', fontFamily: 'DM Sans, sans-serif' }} />
          <button onClick={() => { onRejeitar(motivo); setShowReject(false); setMotivo(''); }} style={{ ...btn, background: '#EF4444', color: '#fff' }}>Confirmar rejeição</button>
          <button onClick={() => { setShowReject(false); setMotivo(''); }} style={{ ...btn, background: 'transparent', color: '#888', border: '1px solid #2A2A2A' }}>Cancelar</button>
        </div>
      )}
    </div>
  );
}

export default function PreEnrollment() {
  const { currentUser, demo } = useApp();
  const [filtro, setFiltro] = useState<'pendente' | 'aprovada' | 'rejeitada' | 'todos'>('pendente');
  const query = usePreMatriculas();
  const update = useUpdatePreMatricula();

  const items: PreMatricula[] = query.data ?? [];
  const filtered = filtro === 'todos' ? items : items.filter(i => i.status === filtro);
  const counts = { pendente: items.filter(i => i.status === 'pendente').length, aprovada: items.filter(i => i.status === 'aprovada').length, rejeitada: items.filter(i => i.status === 'rejeitada').length };

  function handleAprovar(id: string) {
    update.mutate({ id, status: 'aprovada' }, { onSuccess: () => toast.success('Pré-matrícula aprovada!') });
  }
  function handleRejeitar(id: string, motivo: string) {
    update.mutate({ id, status: 'rejeitada', motivo_rejeicao: motivo || undefined }, { onSuccess: () => toast.success('Pré-matrícula rejeitada.') });
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <div style={{ width: '3px', height: '20px', background: '#CC1A1A', borderRadius: '2px' }} />
        <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Pré-Matrículas</h2>
        <span style={txt('rgba(255,255,255,0.4)', 12)}>· {currentUser?.escolaNome}</span>
      </div>

      {demo && <p style={{ ...txt('#EAB308', 12), marginBottom: '16px' }}>Modo demonstração: conecte o banco para ver as pré-matrículas reais.</p>}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {([['pendente', `Pendentes (${counts.pendente})`], ['aprovada', `Aprovadas (${counts.aprovada})`], ['rejeitada', `Rejeitadas (${counts.rejeitada})`], ['todos', 'Todas']] as const).map(([k, label]) => (
          <button key={k} onClick={() => setFiltro(k)} style={{ ...btn, background: filtro === k ? '#22222280' : 'transparent', color: filtro === k ? '#fff' : '#888', border: `1px solid ${filtro === k ? '#333' : '#1E1E1E'}` }}>
            {k === 'pendente' && <Clock size={12} />} {label}
          </button>
        ))}
      </div>

      {query.isLoading ? <Loading /> : query.isError ? <ErrorState onRetry={() => query.refetch()} /> :
        filtered.length === 0 ? <Empty title={filtro === 'pendente' ? 'Nenhuma pré-matrícula pendente' : 'Nenhuma pré-matrícula'} hint={filtro === 'pendente' ? 'Quando alguém preencher o formulário público, aparecerá aqui.' : undefined} /> :
          filtered.map(pm => (
            <Card key={pm.id} pm={pm} onAprovar={() => handleAprovar(pm.id)} onRejeitar={(m) => handleRejeitar(pm.id, m)} />
          ))
      }
    </div>
  );
}