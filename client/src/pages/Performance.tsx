import { useEffect, useState } from 'react';
import { getCategory } from '@/lib/data';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { Activity, TrendingUp, Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import FormModal from '@/components/FormModal';
import { Loading, Empty, ErrorState } from '@/components/PageState';
import {
  useAthletes, usePhysicalEvals, useCreatePhysicalEval, useEvaluations, useCreateEvaluation, TIPO_AVALIACAO, type TipoAvaliacao,
} from '@/lib/queries';

const hoje = () => new Date().toLocaleDateString('en-CA');
const dm = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
const fmt = (v: number | null | undefined, suf = '') => (v === null || v === undefined ? '—' : `${v}${suf}`);

export default function Performance() {
  const { currentUser, demo } = useApp();
  const atl = useAthletes();
  const lista = (atl.data ?? []).filter(a => a.status === 'active');
  const [selectedAthlete, setSelectedAthlete] = useState('');
  const [modal, setModal] = useState<'fisica' | 'avaliacao' | null>(null);
  useEffect(() => { if (!selectedAthlete && lista[0]) setSelectedAthlete(lista[0].id); }, [lista, selectedAthlete]);
  const athlete = lista.find(a => a.id === selectedAthlete);
  const fisicas = usePhysicalEvals(selectedAthlete);
  const avals = useEvaluations(selectedAthlete);
  const criarFisica = useCreatePhysicalEval();
  const criarAval = useCreateEvaluation();
  const podeEditar = demo || currentUser?.role === 'admin' || currentUser?.role === 'coach';

  const historico = fisicas.data ?? [];
  const ultima = historico[historico.length - 1];
  const PERF_HISTORY = historico.map(h => ({ month: dm(h.data), vo2: h.vo2, resistencia: h.resistencia, velocidade: h.velocidade }));
  // Nota mais recente de cada tipo de avaliação
  const RADAR_DATA = (Object.keys(TIPO_AVALIACAO) as TipoAvaliacao[]).map(t => ({
    subject: TIPO_AVALIACAO[t],
    A: (avals.data ?? []).find(a => a.tipo === t)?.nota ?? 0,
  }));

  if (atl.isLoading) return <Loading />;
  if (atl.isError) return <ErrorState onRetry={() => atl.refetch()} />;
  if (!athlete) return <Empty title="Nenhum atleta" hint="Cadastre atletas para acompanhar a performance." />;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '3px', height: '20px', background: '#CC1A1A', borderRadius: '2px' }} />
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Controle de Performance
          </h2>
        </div>
        {podeEditar && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => setModal('avaliacao')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', color: 'rgba(255,255,255,0.7)', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', cursor: 'pointer' }}><Plus size={14} /> Nova avaliação</button>
            <button onClick={() => setModal('fisica')} className="nadgol-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', border: 'none', cursor: 'pointer' }}><Plus size={14} /> Medição física</button>
          </div>
        )}
      </div>

      {/* Athlete selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {lista.slice(0, 12).map(a => (
          <button
            key={a.id}
            onClick={() => setSelectedAthlete(a.id)}
            style={{
              padding: '8px 14px',
              background: selectedAthlete === a.id ? '#CC1A1A' : '#111111',
              border: `1px solid ${selectedAthlete === a.id ? '#CC1A1A' : '#2A2A2A'}`,
              borderRadius: '6px',
              color: selectedAthlete === a.id ? '#fff' : 'rgba(255,255,255,0.5)',
              fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: 500,
              cursor: 'pointer', transition: 'all 150ms',
            }}
          >
            {a.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Athlete header */}
      <div className="nadgol-card nadgol-card-active" style={{ padding: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #CC1A1A, #991414)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff' }}>
          {athlete.name.charAt(0)}
        </div>
        <div>
          <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '22px', color: '#fff', textTransform: 'uppercase' }}>{athlete.name}</h3>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{athlete.position} · {getCategory(athlete.birthYear)}</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: '20px' }}>
          {[
            { label: 'Peso', value: fmt(ultima?.peso ?? (athlete.weight || null), 'kg') },
            { label: 'Altura', value: fmt(ultima?.altura ?? (athlete.height || null), 'cm') },
            { label: 'VO2', value: fmt(ultima?.vo2) },
            { label: 'Velocidade', value: fmt(ultima?.velocidade, 'km/h') },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '22px', color: '#CC1A1A', lineHeight: 1 }}>{value}</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        {/* Evolution chart */}
        <div className="nadgol-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp size={16} color="#CC1A1A" />
            <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Evolução Física
            </h3>
          </div>
          {PERF_HISTORY.length === 0 ? <Empty title="Sem medições" hint="Registre a primeira medição física." /> : <ResponsiveContainer width="100%" height={220}>
            <LineChart data={PERF_HISTORY}>
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', fontFamily: 'DM Sans', fontSize: '12px', color: '#fff' }} />
              <Line type="monotone" dataKey="vo2" stroke="#CC1A1A" strokeWidth={2} dot={{ fill: '#CC1A1A', r: 4 }} name="VO2" />
              <Line type="monotone" dataKey="resistencia" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E', r: 4 }} name="Resistência" />
              <Line type="monotone" dataKey="velocidade" stroke="#EAB308" strokeWidth={2} dot={{ fill: '#EAB308', r: 4 }} name="Velocidade" />
            </LineChart>
          </ResponsiveContainer>}
        </div>

        {/* Radar chart */}
        <div className="nadgol-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Activity size={16} color="#CC1A1A" />
            <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Perfil Atlético
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="#2A2A2A" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'DM Sans' }} />
              <Radar dataKey="A" stroke="#CC1A1A" fill="#CC1A1A" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {modal === 'fisica' && (
        <FormModal
          title={`Medição física · ${athlete.name.split(' ')[0]}`} submitLabel="Salvar" saving={criarFisica.isPending}
          fields={[
            { name: 'data', label: 'Data', type: 'date', required: true },
            { name: 'peso', label: 'Peso (kg)', type: 'number', half: true },
            { name: 'altura', label: 'Altura (cm)', type: 'number', half: true },
            { name: 'vo2', label: 'VO2', type: 'number', half: true },
            { name: 'velocidade', label: 'Velocidade (km/h)', type: 'number', half: true },
            { name: 'resistencia', label: 'Resistência (0–100)', type: 'number', half: true },
          ]}
          onSubmit={v => criarFisica.mutate({ atletaId: athlete.id, data: v.data || hoje(), peso: v.peso, altura: v.altura, vo2: v.vo2, velocidade: v.velocidade, resistencia: v.resistencia }, { onSuccess: () => setModal(null) })}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'avaliacao' && (
        <FormModal
          title={`Nova avaliação · ${athlete.name.split(' ')[0]}`} submitLabel="Salvar" saving={criarAval.isPending}
          fields={[
            { name: 'tipo', label: 'Tipo', type: 'select', required: true, half: true, options: (Object.keys(TIPO_AVALIACAO) as TipoAvaliacao[]).map(t => ({ value: t, label: TIPO_AVALIACAO[t] })) },
            { name: 'nota', label: 'Nota (0–100)', type: 'number', required: true, half: true },
            { name: 'data', label: 'Data', type: 'date', required: true },
            { name: 'comentario', label: 'Comentário (opcional)' },
          ]}
          onSubmit={v => criarAval.mutate({ atletaId: athlete.id, tipo: v.tipo as TipoAvaliacao, data: v.data || hoje(), nota: v.nota, comentario: v.comentario }, { onSuccess: () => setModal(null) })}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
