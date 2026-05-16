import { useState, useEffect } from 'react';
import { ATHLETES, FINANCIAL, ATTENDANCE, COMPETITIONS, getBirthdaysThisMonth, getCategory } from '@/lib/data';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, UserCheck, UserX, Gift, AlertCircle, Star, Trophy, Calendar, TrendingUp, Zap } from 'lucide-react';

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

const EVOLUTION_DATA = [
  { month: 'Jan', atletas: 8, presenca: 82 },
  { month: 'Fev', atletas: 9, presenca: 85 },
  { month: 'Mar', atletas: 10, presenca: 88 },
  { month: 'Abr', atletas: 11, presenca: 86 },
  { month: 'Mai', atletas: 12, presenca: 90 },
];

const PERF_DATA = [
  { name: 'Lucas', score: 95 },
  { name: 'Pedro', score: 88 },
  { name: 'Gabriel', score: 82 },
  { name: 'Matheus', score: 91 },
  { name: 'Felipe', score: 75 },
];

export default function Dashboard() {
  const totalAthletes = ATHLETES.filter(a => a.status === 'active').length;
  const todayAttendance = ATTENDANCE.filter(a => a.date === '2026-05-15');
  const presentToday = todayAttendance.filter(a => a.status === 'present').length;
  const absentToday = todayAttendance.filter(a => a.status === 'absent').length;
  const birthdays = getBirthdaysThisMonth();
  const pendingPayments = FINANCIAL.filter(f => f.status === 'pending' || f.status === 'overdue').length;
  const topAthlete = ATHLETES.find(a => a.ranking === 1);

  const StatCard = ({ icon: Icon, label, value, sub, color, delay }: any) => (
    <div
      className="nadgol-card"
      style={{
        padding: '20px',
        opacity: 0,
        animation: `fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms forwards`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '8px',
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
        {sub && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.3)', background: '#1A1A1A', padding: '3px 8px', borderRadius: '4px' }}>{sub}</span>}
      </div>
      <p className="nadgol-stat-number" style={{ fontSize: '36px', color: '#fff', marginBottom: '4px' }}>
        <AnimatedNumber value={typeof value === 'number' ? value : 0} />
        {typeof value === 'string' && value}
      </p>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>{label}</p>
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1400px' }}>
      {/* Welcome banner */}
      <div style={{
        marginBottom: '28px',
        opacity: 0,
        animation: 'fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0ms forwards',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <img
            src="/manus-storage/68db7c69-d5fd-4129-8544-30bbc90c29b1_1c2e822c.jpg"
            alt="Nadgol Academy Shield"
            style={{ width: '40px', height: 'auto', filter: 'drop-shadow(0 0 12px rgba(204,26,26,0.25))' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '3px', height: '20px', background: '#CC1A1A', borderRadius: '2px' }} />
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '28px', color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Visão Geral da Academia
            </h2>
          </div>
        </div>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginLeft: '11px' }}>
          Sexta-feira, 16 de Maio de 2026 · Temporada 2026
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <StatCard icon={Users} label="Total de Atletas" value={totalAthletes} color="#CC1A1A" delay={50} />
        <StatCard icon={UserCheck} label="Presentes Hoje" value={presentToday} sub="Hoje" color="#22C55E" delay={100} />
        <StatCard icon={UserX} label="Ausentes Hoje" value={absentToday} color="#EF4444" delay={150} />
        <StatCard icon={Gift} label="Aniversariantes" value={birthdays.length} sub="Este mês" color="#EAB308" delay={200} />
        <StatCard icon={AlertCircle} label="Mensalidades Pendentes" value={pendingPayments} color="#F97316" delay={250} />
        <StatCard icon={Trophy} label="Competições" value={COMPETITIONS.length} color="#A855F7" delay={300} />
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Evolution chart */}
        <div className="nadgol-card" style={{ padding: '20px', opacity: 0, animation: 'fadeInUp 0.5s ease-out 350ms forwards' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp size={16} color="#CC1A1A" />
            <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Evolução de Atletas
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={EVOLUTION_DATA}>
              <defs>
                <linearGradient id="gradAtletas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CC1A1A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#CC1A1A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', fontFamily: 'DM Sans', fontSize: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="atletas" stroke="#CC1A1A" strokeWidth={2} fill="url(#gradAtletas)" dot={{ fill: '#CC1A1A', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Performance chart */}
        <div className="nadgol-card" style={{ padding: '20px', opacity: 0, animation: 'fadeInUp 0.5s ease-out 400ms forwards' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Zap size={16} color="#CC1A1A" />
            <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Top Performance
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={PERF_DATA} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} domain={[60, 100]} />
              <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', fontFamily: 'DM Sans', fontSize: '12px', color: '#fff' }} />
              <Bar dataKey="score" fill="#CC1A1A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        {/* Athlete Highlight */}
        {topAthlete && (
          <div className="nadgol-card nadgol-card-active" style={{ padding: '20px', opacity: 0, animation: 'fadeInUp 0.5s ease-out 450ms forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Star size={16} color="#CC1A1A" />
              <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '14px', color: '#CC1A1A', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Atleta Destaque
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #CC1A1A, #991414)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '22px', color: '#fff',
                border: '2px solid rgba(204,26,26,0.4)',
              }}>
                {topAthlete.name.charAt(0)}
              </div>
              <div>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '18px', color: '#fff' }}>{topAthlete.name}</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{topAthlete.position} · {getCategory(topAthlete.birthYear)}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Gols', value: topAthlete.goals },
                { label: 'Assist.', value: topAthlete.assists },
                { label: 'Pres.', value: `${topAthlete.attendance}%` },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center', background: '#1A1A1A', borderRadius: '4px', padding: '8px 4px' }}>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '20px', color: '#CC1A1A' }}>{value}</p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next trainings */}
        <div className="nadgol-card" style={{ padding: '20px', opacity: 0, animation: 'fadeInUp 0.5s ease-out 500ms forwards' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Calendar size={16} color="#CC1A1A" />
            <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '14px', color: '#fff', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Próximos Treinos
            </h3>
          </div>
          {[
            { day: 'Segunda', time: '08:00', turma: 'Sub-15/14', unit: 'Centro' },
            { day: 'Terça', time: '14:00', turma: 'Sub-15/13', unit: 'Norte' },
            { day: 'Quarta', time: '16:00', turma: 'Sub-13/12', unit: 'Sul' },
            { day: 'Quinta', time: '07:00', turma: 'Performance Elite', unit: 'Studio CT' },
          ].map((t, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: i < 3 ? '1px solid #1E1E1E' : 'none',
            }}>
              <div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '13px', color: '#fff' }}>{t.turma}</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{t.day} · {t.unit}</p>
              </div>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#CC1A1A' }}>{t.time}</span>
            </div>
          ))}
        </div>

        {/* Competitions */}
        <div className="nadgol-card" style={{ padding: '20px', opacity: 0, animation: 'fadeInUp 0.5s ease-out 550ms forwards' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Trophy size={16} color="#CC1A1A" />
            <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '14px', color: '#fff', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Competições
            </h3>
          </div>
          {COMPETITIONS.map((comp, i) => (
            <div key={comp.id} style={{
              padding: '10px 0',
              borderBottom: i < COMPETITIONS.length - 1 ? '1px solid #1E1E1E' : 'none',
            }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '13px', color: '#fff', marginBottom: '4px' }}>{comp.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                  {new Date(comp.date).toLocaleDateString('pt-BR')}
                </p>
                {comp.result ? (
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: '#22C55E', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                    {comp.result}
                  </span>
                ) : (
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: '#EAB308', background: 'rgba(234,179,8,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                    Em breve
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
