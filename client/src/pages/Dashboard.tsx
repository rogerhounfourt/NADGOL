import { useState, useEffect } from 'react';
import { useAthletes, useFinancial, useDashboard, competenciaAtual } from '@/lib/queries';
import { Loading, ErrorState } from '@/components/PageState';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import AvatarAtleta from '@/components/AvatarAtleta';
import { useApp } from '@/contexts/AppContext';
import { Users, UserCheck, UserX, TrendingUp, Trophy, AlertCircle, Zap, Target } from 'lucide-react';

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display}</>;
}

export default function Dashboard() {
  const { currentUser } = useApp();
  const equipe = currentUser?.role === 'admin' || currentUser?.role === 'coach';
  const atl = useAthletes();
  const fin = useFinancial(competenciaAtual());
  const dash = useDashboard();
  const athletes = atl.data ?? [];
  const financial = fin.data ?? [];
  const totalAthletes = athletes.filter(a => a.status === 'active').length;
  const presentToday = dash.data?.presentes ?? 0;
  const absentToday = dash.data?.ausentes ?? 0;
  const lateToday = dash.data?.atrasados ?? 0;
  const registrosHoje = presentToday + absentToday + lateToday;
  const attendanceRate = registrosHoje ? Math.round(((presentToday + lateToday) / registrosHoje) * 100) : 0;
  const mesAtual = new Date().getMonth() + 1;
  const birthdays = athletes.filter(a => Number(a.birthDate.split('-')[1]) === mesAtual);
  const hoje = new Date();
  const mmdd = (d: string) => d.slice(5, 10);
  const hojeMD = `${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  const ativos = athletes.filter(a => a.status === 'active' && a.birthDate);
  const aniversariantesHoje = ativos.filter(a => mmdd(a.birthDate) === hojeMD);
  const proximosAniv = ativos
    .filter(a => mmdd(a.birthDate) > hojeMD).sort((a, b) => mmdd(a.birthDate).localeCompare(mmdd(b.birthDate))).slice(0, 3);
  const linkParabens = (a: { name: string; phone: string; birthDate: string }) => {
    const num = (a.phone || '').replace(/\D/g, '');
    if (num.length < 10) return null;
    const idade = hoje.getFullYear() - Number(a.birthDate.slice(0, 4));
    const msg = `Parabéns, ${a.name.split(' ')[0]}! 🎉⚽ A família Nadgol Academy deseja um dia incrível e um novo ciclo cheio de gols, evolução e conquistas. Feliz aniversário de ${idade} anos!`;
    return `https://wa.me/${num.startsWith('55') && num.length >= 12 ? num : '55' + num}?text=${encodeURIComponent(msg)}`;
  };
  const pendingPayments = financial.filter(f => f.status === 'pending' || f.status === 'overdue').length;
  const EVOLUTION_DATA = dash.data?.evolucao ?? [];
  const PERFORMANCE_DATA = [...athletes]
    .map(a => ({ name: a.name.split(' ')[0], score: (a.goals ?? 0) * 3 + (a.assists ?? 0) * 2 }))
    .sort((a, b) => b.score - a.score).slice(0, 5);
  const ATTENDANCE_DISTRIBUTION = [
    { name: 'Presentes', value: presentToday, color: '#22C55E' },
    { name: 'Ausentes', value: absentToday, color: '#EF4444' },
    { name: 'Atrasados', value: lateToday, color: '#EAB308' },
  ];
  const competitionsCount = dash.data?.competicoes ?? 0;

  if (atl.isLoading || dash.isLoading) return <Loading />;
  if (atl.isError || dash.isError) return <ErrorState onRetry={() => { atl.refetch(); dash.refetch(); }} />;

  const StatCard = ({ icon: Icon, label, value, sub, color, delay }: any) => (
    <div
      style={{
        padding: '20px',
        background: '#111111',
        border: '1px solid #1E1E1E',
        borderRadius: '8px',
        opacity: 0,
        animation: `fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms forwards`,
        transition: 'all 200ms ease-out',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#1A1A1A';
        e.currentTarget.style.borderColor = '#2A2A2A';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#111111';
        e.currentTarget.style.borderColor = '#1E1E1E';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '10px',
          background: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${color}30`,
        }}>
          <Icon size={22} color={color} strokeWidth={1.5} />
        </div>
        {sub && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: color, background: `${color}15`, padding: '4px 10px', borderRadius: '4px', border: `1px solid ${color}30`, fontWeight: 600 }}>{sub}</span>}
      </div>
      <p style={{ fontSize: '32px', fontWeight: 700, color: '#fff', marginBottom: '6px', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.5px' }}>
        {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
      </p>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{label}</p>
    </div>
  );

  const ChartCard = ({ title, children, delay }: any) => (
    <div
      style={{
        padding: '24px',
        background: '#111111',
        border: '1px solid #1E1E1E',
        borderRadius: '8px',
        opacity: 0,
        animation: `fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms forwards`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <div style={{ width: '3px', height: '18px', background: '#CC1A1A', borderRadius: '2px' }} />
        <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header with Shield */}
      <div style={{
        marginBottom: '32px',
        opacity: 0,
        animation: 'fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0ms forwards',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <img
            src="/escudo-nadgol.svg"
            alt="Nadgol Academy Shield"
            style={{ width: '48px', height: 'auto', filter: 'drop-shadow(0 0 16px rgba(204,26,26,0.3))' }}
          />
          <div>
            <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '36px', color: '#fff', letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1, marginBottom: '4px' }}>
              Dashboard
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Visão Geral da Academia · Temporada 2026
            </p>
          </div>
        </div>
      </div>

      {equipe && (
        <div style={{ marginBottom: '24px', padding: '16px 20px', background: 'linear-gradient(135deg, rgba(234,179,8,0.10), rgba(204,26,26,0.06))', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '8px' }}>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#EAB308', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 10px' }}>🎂 Aniversariantes de hoje</p>
          {aniversariantesHoje.length === 0 ? (
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              Ninguém faz aniversário hoje.{proximosAniv.length > 0 && ` Próximos: ${proximosAniv.map(a => `${a.name.split(' ')[0]} (${a.birthDate.slice(8, 10)}/${a.birthDate.slice(5, 7)})`).join(', ')}.`}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {aniversariantesHoje.map(a => {
                const link = linkParabens(a);
                return (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AvatarAtleta nome={a.name} foto={a.photo} tamanho={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#fff', fontWeight: 600, margin: 0 }}>{a.name}</p>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Faz {hoje.getFullYear() - Number(a.birthDate.slice(0, 4))} anos hoje</p>
                    </div>
                    {link
                      ? <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`Parabenizar ${a.name.split(' ')[0]} no WhatsApp`} title="Parabenizar no WhatsApp"
                          style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        </a>
                      : <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>Sem telefone</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard icon={Users} label="Total de Atletas" value={totalAthletes} color="#CC1A1A" delay={50} />
        <StatCard icon={UserCheck} label="Presentes Hoje" value={presentToday} sub="Hoje" color="#22C55E" delay={100} />
        <StatCard icon={UserX} label="Ausentes" value={absentToday} color="#EF4444" delay={150} />
        <StatCard icon={AlertCircle} label="Atrasados" value={lateToday} color="#EAB308" delay={200} />
        <StatCard icon={TrendingUp} label="Taxa de Presença" value={`${attendanceRate}%`} color="#3B82F6" delay={250} />
        <StatCard icon={Trophy} label="Competições" value={competitionsCount} color="#A855F7" delay={300} />
      </div>

      {/* Main Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '32px' }}>
        {/* Evolution Chart */}
        <ChartCard title="Evolução de Atletas" delay={350}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={EVOLUTION_DATA}>
              <defs>
                <linearGradient id="gradAtletas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CC1A1A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#CC1A1A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', fontFamily: 'DM Sans' }} />
              <Area type="monotone" dataKey="atletas" stroke="#CC1A1A" strokeWidth={2} fill="url(#gradAtletas)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Attendance Distribution */}
        <ChartCard title="Distribuição" delay={400}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={ATTENDANCE_DISTRIBUTION} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                {ATTENDANCE_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', fontFamily: 'DM Sans' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Performance and Financial Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        {/* Top Performance */}
        <ChartCard title="Top Performance" delay={450}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={PERFORMANCE_DATA}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', fontFamily: 'DM Sans' }} />
              <Bar dataKey="score" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Financial Status */}
        <ChartCard title="Status Financeiro" delay={500}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#1A1A1A', borderRadius: '6px', border: '1px solid #2A2A2A' }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Pagos</span>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '18px', fontWeight: 700, color: '#22C55E' }}>
                {financial.filter(f => f.status === 'paid').length}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#1A1A1A', borderRadius: '6px', border: '1px solid #2A2A2A' }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Pendentes</span>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '18px', fontWeight: 700, color: '#EAB308' }}>
                {financial.filter(f => f.status === 'pending').length}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#1A1A1A', borderRadius: '6px', border: '1px solid #2A2A2A' }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Atrasados</span>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '18px', fontWeight: 700, color: '#EF4444' }}>
                {financial.filter(f => f.status === 'overdue').length}
              </span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Quick Actions */}
      <div style={{
        padding: '24px',
        background: '#111111',
        border: '1px solid #1E1E1E',
        borderRadius: '8px',
        opacity: 0,
        animation: 'fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 550ms forwards',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ width: '3px', height: '18px', background: '#CC1A1A', borderRadius: '2px' }} />
          <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Próximas Ações
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', background: '#1A1A1A', borderRadius: '6px', border: '1px solid #2A2A2A', cursor: 'pointer', transition: 'all 200ms' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#CC1A1A'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Aniversariantes</p>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '20px', fontWeight: 700, color: '#EAB308' }}>{birthdays.length}</p>
          </div>
          <div style={{ padding: '12px', background: '#1A1A1A', borderRadius: '6px', border: '1px solid #2A2A2A', cursor: 'pointer', transition: 'all 200ms' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#CC1A1A'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Mensalidades Pendentes</p>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '20px', fontWeight: 700, color: '#EF4444' }}>{pendingPayments}</p>
          </div>
          <div style={{ padding: '12px', background: '#1A1A1A', borderRadius: '6px', border: '1px solid #2A2A2A', cursor: 'pointer', transition: 'all 200ms' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#CC1A1A'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Próximas Competições</p>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '20px', fontWeight: 700, color: '#A855F7' }}>{competitionsCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
