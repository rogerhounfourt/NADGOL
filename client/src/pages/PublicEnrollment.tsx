import { useState, useEffect, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

interface Escola { id: string; nome: string; escudo_url?: string }

const POSICOES = ['Goleiro','Zagueiro','Lateral Direito','Lateral Esquerdo','Volante','Meia','Atacante','Ponta Direita','Ponta Esquerda','Centroavante'];
const PES = ['Direito','Esquerdo','Ambos'];
const COMO_CONHECEU = ['Instagram','Facebook','Indicação de amigo','Indicação de atleta','Panfleto/banner','Passou na frente','Outro'];
const PARENTESCOS = ['Pai','Mãe','Avô/Avó','Tio/Tia','Irmão/Irmã','Responsável legal','Outro'];

export default function PublicEnrollment() {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [escolaId, setEscolaId] = useState('');
  const [nomeAtleta, setNomeAtleta] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [posicao, setPosicao] = useState('');
  const [peDominante, setPeDominante] = useState('');
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [telefoneResponsavel, setTelefoneResponsavel] = useState('');
  const [emailResponsavel, setEmailResponsavel] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [comoConheceu, setComoConheceu] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    supabase.from('nadgol_escolas').select('id, nome, escudo_url').then(({ data }) => {
      if (data) {
        setEscolas(data);
        if (data.length === 1) setEscolaId(data[0].id);
      }
      setLoading(false);
    });
  }, []);

  function formatPhone(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!escolaId) { setError('Selecione uma escola.'); return; }
    setSubmitting(true);
    const { error: err } = await supabase.from('nadgol_pre_matriculas').insert({
      escola_id: escolaId,
      nome_atleta: nomeAtleta.trim(),
      data_nascimento: dataNascimento,
      sexo,
      posicao: posicao || null,
      pe_dominante: peDominante || null,
      nome_responsavel: nomeResponsavel.trim(),
      telefone_responsavel: telefoneResponsavel.replace(/\D/g, ''),
      email_responsavel: emailResponsavel.trim() || null,
      parentesco: parentesco || null,
      bairro: bairro.trim() || null,
      cidade: cidade.trim() || null,
      como_conheceu: comoConheceu || null,
      observacoes: observacoes.trim() || null,
    });
    setSubmitting(false);
    if (err) { setError(err.message.includes('row-level') ? 'Erro de permissão. Tente novamente.' : err.message); return; }
    setSuccess(true);
  }

  if (loading) return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div style={styles.spinner} />
        </div>
      </div>
    </div>
  );

  if (success) return (
    <div style={styles.wrapper}>
      <div style={{ ...styles.card, textAlign: 'center' as const }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>⚽</div>
        <h1 style={{ ...styles.title, color: '#22C55E' }}>Pré-matrícula enviada!</h1>
        <p style={{ color: '#A0A0A0', fontSize: '15px', lineHeight: '1.6', marginTop: '12px' }}>
          Recebemos sua solicitação de pré-matrícula.<br/>
          A equipe da escolinha entrará em contato em breve para confirmar a vaga.
        </p>
        <button onClick={() => { setSuccess(false); setNomeAtleta(''); setDataNascimento(''); setSexo(''); setPosicao(''); setPeDominante(''); setNomeResponsavel(''); setTelefoneResponsavel(''); setEmailResponsavel(''); setParentesco(''); setBairro(''); setCidade(''); setComoConheceu(''); setObservacoes(''); }} style={styles.btnSecondary}>
          Enviar outra pré-matrícula
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center' as const, marginBottom: '28px' }}>
          {escolas.length === 1 && escolas[0].escudo_url && (
            <img src={escolas[0].escudo_url} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' }} />
          )}
          <h1 style={styles.title}>Pré-Matrícula</h1>
          <p style={{ color: '#A0A0A0', fontSize: '14px', marginTop: '4px' }}>Nadgol Academy</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {escolas.length > 1 && (
            <div>
              <label style={styles.label}>Escola *</label>
              <select value={escolaId} onChange={e => setEscolaId(e.target.value)} required style={styles.input}>
                <option value="">Selecione...</option>
                {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
            </div>
          )}

          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>Dados do Atleta</legend>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Nome completo *</label>
                <input type="text" value={nomeAtleta} onChange={e => setNomeAtleta(e.target.value)} required minLength={2} maxLength={120} placeholder="Nome do atleta" style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Data de nascimento *</label>
                <input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} required max={new Date().toISOString().slice(0, 10)} style={styles.input} />
              </div>
            </div>
            <div style={styles.grid3}>
              <div>
                <label style={styles.label}>Sexo *</label>
                <select value={sexo} onChange={e => setSexo(e.target.value)} required style={styles.input}>
                  <option value="">Selecione...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Posição</label>
                <select value={posicao} onChange={e => setPosicao(e.target.value)} style={styles.input}>
                  <option value="">Não definida</option>
                  {POSICOES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Pé dominante</label>
                <select value={peDominante} onChange={e => setPeDominante(e.target.value)} style={styles.input}>
                  <option value="">Não definido</option>
                  {PES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>Responsável</legend>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Nome do responsável *</label>
                <input type="text" value={nomeResponsavel} onChange={e => setNomeResponsavel(e.target.value)} required minLength={2} maxLength={120} placeholder="Nome completo" style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Parentesco</label>
                <select value={parentesco} onChange={e => setParentesco(e.target.value)} style={styles.input}>
                  <option value="">Selecione...</option>
                  {PARENTESCOS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Telefone (WhatsApp) *</label>
                <input type="tel" value={telefoneResponsavel} onChange={e => setTelefoneResponsavel(formatPhone(e.target.value))} required placeholder="(00) 00000-0000" style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>E-mail</label>
                <input type="email" value={emailResponsavel} onChange={e => setEmailResponsavel(e.target.value)} placeholder="email@exemplo.com" style={styles.input} />
              </div>
            </div>
          </fieldset>

          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>Informações Adicionais</legend>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Bairro</label>
                <input type="text" value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Bairro" style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Cidade</label>
                <input type="text" value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Cidade" style={styles.input} />
              </div>
            </div>
            <div>
              <label style={styles.label}>Como conheceu a escolinha?</label>
              <select value={comoConheceu} onChange={e => setComoConheceu(e.target.value)} style={styles.input}>
                <option value="">Selecione...</option>
                {COMO_CONHECEU.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Observações</label>
              <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Alguma informação extra? (alergias, condição médica, experiência prévia...)" rows={3} style={{ ...styles.input, resize: 'vertical' as const }} />
            </div>
          </fieldset>

          <button type="submit" disabled={submitting} style={{ ...styles.btn, opacity: submitting ? 0.6 : 1 }}>
            {submitting ? 'Enviando...' : '⚽ Enviar Pré-Matrícula'}
          </button>
        </form>
      </div>
      <p style={{ textAlign: 'center' as const, color: '#555', fontSize: '12px', marginTop: '16px' }}>
        Nadgol Academy © {new Date().getFullYear()}
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '24px 16px', background: 'linear-gradient(135deg, #0A0A0A 0%, #111 50%, #0A0A0A 100%)',
    fontFamily: 'DM Sans, Inter, system-ui, sans-serif',
  },
  card: {
    width: '100%', maxWidth: '580px', background: '#141414', border: '1px solid #222',
    borderRadius: '16px', padding: '32px 28px',
  },
  title: { fontSize: '22px', fontWeight: 700, color: '#F0F0F0', margin: 0 },
  label: { display: 'block', fontSize: '13px', fontWeight: 500, color: '#999', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 12px', background: '#1A1A1A', border: '1px solid #2A2A2A',
    borderRadius: '8px', color: '#E0E0E0', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s',
  },
  fieldset: { border: '1px solid #1E1E1E', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' },
  legend: { fontSize: '13px', fontWeight: 600, color: '#888', padding: '0 8px', letterSpacing: '0.5px', textTransform: 'uppercase' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' },
  btn: {
    width: '100%', padding: '14px', background: '#22C55E', border: 'none', borderRadius: '10px',
    color: '#000', fontSize: '15px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.3px',
    transition: 'opacity 0.2s, transform 0.1s',
  },
  btnSecondary: {
    marginTop: '20px', padding: '12px 24px', background: 'transparent', border: '1px solid #333',
    borderRadius: '8px', color: '#A0A0A0', fontSize: '14px', cursor: 'pointer',
  },
  errorBox: {
    padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px', color: '#EF4444', fontSize: '13px', marginBottom: '12px',
  },
  spinner: {
    width: '32px', height: '32px', border: '3px solid #222', borderTopColor: '#22C55E',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
};