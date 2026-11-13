import { useState } from 'react';
import { toast } from 'sonner';
import { Copy, Plus, Trash2, Building2, Link2, Users } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import FormModal from '@/components/FormModal';
import { Loading, Empty, ErrorState } from '@/components/PageState';
import {
  useAthletes, useAllSchools, useCreateSchool, useInvites, useCreateInvite, useRevokeInvite, useMembers, useSetMemberActive,
  linkConvite, PAPEL_NOME, type Papel,
} from '@/lib/queries';

const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', border: 'none' };
const ghost: React.CSSProperties = { ...btn, background: 'transparent', border: '1px solid #2A2A2A', color: 'rgba(255,255,255,0.7)' };
const txt = (c = '#fff', s = 13): React.CSSProperties => ({ fontFamily: 'DM Sans, sans-serif', fontSize: `${s}px`, color: c });

function Card({ title, icon: Icon, action, children }: { title: string; icon: any; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="nadgol-card" style={{ padding: '20px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon size={16} color="#CC1A1A" /> {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: '1px solid #1E1E1E', flexWrap: 'wrap' }}>{children}</div>
);

const badge = (t: string, c: string) => (
  <span style={{ ...txt(c, 10), background: `${c}15`, border: `1px solid ${c}30`, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t}</span>
);

async function copiar(texto: string) {
  try { await navigator.clipboard.writeText(texto); toast.success('Link copiado.'); }
  catch { toast.message('Copie o link manualmente', { description: texto }); }
}

export default function Access() {
  const { currentUser, escolas, trocarEscola, demo } = useApp();
  const superAdmin = !!currentUser?.superAdmin;
  const schools = useAllSchools(superAdmin);
  const invites = useInvites();
  const members = useMembers();
  const athletes = useAthletes();
  const createSchool = useCreateSchool();
  const createInvite = useCreateInvite();
  const revoke = useRevokeInvite();
  const setActive = useSetMemberActive();
  const [modal, setModal] = useState<'escola' | 'convite' | null>(null);
  const [novoLink, setNovoLink] = useState<string | null>(null);

  const agora = Date.now();
  const atletaOpcoes = (athletes.data ?? []).map(a => ({ value: a.id, label: a.name }));

  return (
    <div style={{ padding: '24px', maxWidth: '860px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <div style={{ width: '3px', height: '20px', background: '#CC1A1A', borderRadius: '2px' }} />
        <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Acessos</h2>
        <span style={txt('rgba(255,255,255,0.4)', 12)}>· {currentUser?.escolaNome}</span>
      </div>

      {demo && <p style={{ ...txt('#EAB308', 12), marginBottom: '16px' }}>Modo demonstração: conecte o banco para criar escolinhas e convites de verdade.</p>}

      {superAdmin && (
        <Card title="Escolinhas" icon={Building2} action={<button className="nadgol-btn-primary" style={btn} onClick={() => setModal('escola')}><Plus size={14} /> Nova escolinha</button>}>
          {schools.isLoading ? <Loading /> : schools.isError ? <ErrorState onRetry={() => schools.refetch()} /> :
            (schools.data ?? []).length === 0 ? <Empty title="Nenhuma escolinha" /> :
              (schools.data ?? []).map(e => (
                <Row key={e.id}>
                  <div>
                    <p style={txt()}>{e.nome}</p>
                    <p style={txt('rgba(255,255,255,0.4)', 11)}>{e.slug} · plano {e.plano}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {badge(e.status, e.status === 'ativa' ? '#22C55E' : '#EF4444')}
                    {e.id === currentUser?.escolaId
                      ? badge('atual', '#3B82F6')
                      : escolas.some(x => x.id === e.id) && <button style={ghost} onClick={() => trocarEscola(e.id)}>Abrir</button>}
                  </div>
                </Row>
              ))}
        </Card>
      )}

      <Card title="Convites" icon={Link2} action={<button className="nadgol-btn-primary" style={btn} onClick={() => { setNovoLink(null); setModal('convite'); }}><Plus size={14} /> Novo convite</button>}>
        <p style={{ ...txt('rgba(255,255,255,0.45)', 12), marginBottom: '12px' }}>
          Gere um link e envie por WhatsApp. A pessoa cria a conta (ou entra) e já fica vinculada à escolinha. Cada link vale 7 dias e só pode ser usado uma vez.
        </p>
        {invites.isLoading ? <Loading /> : invites.isError ? <ErrorState onRetry={() => invites.refetch()} /> :
          (invites.data ?? []).length === 0 ? <Empty title="Nenhum convite ainda" hint="Clique em Novo convite para começar." /> :
            (invites.data ?? []).map(c => {
              const expirado = !c.usadoEm && new Date(c.expiraEm).getTime() < agora;
              return (
                <Row key={c.id}>
                  <div>
                    <p style={txt()}>{c.nome || PAPEL_NOME[c.papel]}{c.atletaNome ? ` · ${c.atletaNome}` : ''}</p>
                    <p style={txt('rgba(255,255,255,0.4)', 11)}>{PAPEL_NOME[c.papel]} · expira em {new Date(c.expiraEm).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {c.usadoEm ? badge('usado', '#22C55E') : expirado ? badge('expirado', '#EF4444') : badge('pendente', '#EAB308')}
                    {!c.usadoEm && !expirado && <button style={ghost} onClick={() => copiar(linkConvite(c.token))}><Copy size={13} /> Copiar link</button>}
                    {!c.usadoEm && <button style={ghost} aria-label="Cancelar convite" onClick={() => revoke.mutate(c.id)}><Trash2 size={13} /></button>}
                  </div>
                </Row>
              );
            })}
      </Card>

      <Card title="Quem tem acesso" icon={Users}>
        {members.isLoading ? <Loading /> : members.isError ? <ErrorState onRetry={() => members.refetch()} /> :
          (members.data ?? []).length === 0 ? <Empty title="Ninguém ainda" /> :
            (members.data ?? []).map(m => (
              <Row key={m.id}>
                <div>
                  <p style={{ ...txt(), opacity: m.ativo ? 1 : 0.5 }}>{m.nome}</p>
                  <p style={txt('rgba(255,255,255,0.4)', 11)}>{m.email}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {badge(PAPEL_NOME[m.papel], '#3B82F6')}
                  {m.usuarioId !== currentUser?.id && (
                    <button style={ghost} onClick={() => setActive.mutate({ id: m.id, ativo: !m.ativo })}>{m.ativo ? 'Desativar' : 'Reativar'}</button>
                  )}
                </div>
              </Row>
            ))}
      </Card>

      {modal === 'escola' && (
        <FormModal
          title="Nova escolinha" submitLabel="Criar" saving={createSchool.isPending}
          fields={[{ name: 'nome', label: 'Nome da escolinha', required: true, placeholder: 'Ex.: Escolinha Craques do Futuro' }]}
          onSubmit={v => createSchool.mutate({ nome: v.nome }, { onSuccess: () => setModal(null) })}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'convite' && !novoLink && (
        <FormModal
          title="Novo convite" submitLabel="Gerar link" saving={createInvite.isPending}
          fields={[
            { name: 'papel', label: 'Tipo de acesso', type: 'select', required: true, options: [
              { value: 'treinador', label: 'Treinador' }, { value: 'responsavel', label: 'Responsável (pai/mãe)' },
              { value: 'atleta', label: 'Atleta' }, { value: 'admin', label: 'Administrador da escolinha' } ] },
            { name: 'nome', label: 'Nome da pessoa (opcional)', placeholder: 'Para você identificar o convite' },
            { name: 'atletaId', label: 'Atleta vinculado (obrigatório para Responsável e Atleta)', type: 'select', options: atletaOpcoes },
          ]}
          onSubmit={v => {
            const papel = v.papel as Papel;
            if ((papel === 'responsavel' || papel === 'atleta') && !v.atletaId) { toast.error('Escolha o atleta vinculado.'); return; }
            createInvite.mutate({ papel, nome: v.nome, atletaId: papel === 'responsavel' || papel === 'atleta' ? v.atletaId : undefined }, {
              onSuccess: token => { if (token) setNovoLink(linkConvite(token)); else setModal(null); },
            });
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'convite' && novoLink && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => { setModal(null); setNovoLink(null); }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} />
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', background: '#111', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '520px' }}>
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '22px', color: '#fff', textTransform: 'uppercase', marginBottom: '12px' }}>Convite criado</h2>
            <p style={{ ...txt('rgba(255,255,255,0.5)', 12), marginBottom: '10px' }}>Envie este link para a pessoa. Vale por 7 dias e uma única vez.</p>
            <input readOnly value={novoLink} onFocus={e => e.currentTarget.select()} style={{ width: '100%', padding: '10px 12px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', ...txt('#fff', 12) }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button style={ghost} onClick={() => { setModal(null); setNovoLink(null); }}>Fechar</button>
              <button className="nadgol-btn-primary" style={btn} onClick={() => copiar(novoLink)}><Copy size={14} /> Copiar link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
