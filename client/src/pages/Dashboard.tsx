import { useState, useEffect } from 'react';
import { ATHLETES, FINANCIAL, ATTENDANCE, COMPETITIONS, getBirthdaysThisMonth } from '@/lib/data';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
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

const EVOLUTION_DATA = [
  { month: 'Jan', atletas: 8, presenca: 82 },
  { month: 'Fev', atletas: 9, presenca: 85 },
  { month: 'Mar', atletas: 10, presenca: 88 },
  { month: 'Abr', atletas: 11, presenca: 86 },
  { month: 'Mai', atletas: 12, presenca: 90 },
];

const PERFORMANCE_DATA = [
  { name: 'Lucas', score: 95 },
  { name: 'Pedro', score: 88 },
  { name: 'Gabriel', score: 82 },
  { name: 'Matheus', score: 91 },
  { name: 'Felipe', score: 75 },
];

const ATTENDANCE_DISTRIBUTION = [
  { name: 'Presentes', value: 42, color: '#22C55E' },
  { name: 'Ausentes', value: 3, color: '#EF4444' },
  { name: 'Atrasados', value: 5, color: '#EAB308' },
];

export default function Dashboard() {
  const totalAthletes = ATHLETES.filter(a => a.status === 'active').length;
  const todayAttendance = ATTENDANCE.filter(a => a.date === '2026-05-15');
  const presentToday = todayAttendance.filter(a => a.status === 'present').length;
  const absentToday = todayAttendance.filter(a => a.status === 'absent').length;
  const lateToday = todayAttendance.filter(a => a.status === 'late').length;
  const birthdays = getBirthdaysThisMonth();
  const pendingPayments = FINANCIAL.filter(f => f.status === 'pending' || f.status === 'overdue').length;
  const attendanceRate = Math.round((presentToday / (presentToday + absentToday + lateToday)) * 100);

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
        <AnimatedNumber value={typeof value === 'number' ? value : 0} />
        {typeof value === 'string' && value}
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
            src="/manus-storage/68db7c69-d5fd-4129-8544-30bbc90c29b1_1c2e822c.jpg"
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

      {/* Key Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard icon={Users} label="Total de Atletas" value={totalAthletes} color="#CC1A1A" delay={50} />
        <StatCard icon={UserCheck} label="Presentes Hoje" value={presentToday} sub="Hoje" color="#22C55E" delay={100} />
        <StatCard icon={UserX} label="Ausentes" value={absentToday} color="#EF4444" delay={150} />
        <StatCard icon={AlertCircle} label="Atrasados" value={lateToday} color="#EAB308" delay={200} />
        <StatCard icon={TrendingUp} label="Taxa de Presença" value={`${attendanceRate}%`} color="#3B82F6" delay={250} />
        <StatCard icon={Trophy} label="Competições" value={COMPETITIONS.length} color="#A855F7" delay={300} />
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
                {FINANCIAL.filter(f => f.status === 'paid').length}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#1A1A1A', borderRadius: '6px', border: '1px solid #2A2A2A' }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Pendentes</span>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '18px', fontWeight: 700, color: '#EAB308' }}>
                {FINANCIAL.filter(f => f.status === 'pending').length}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#1A1A1A', borderRadius: '6px', border: '1px solid #2A2A2A' }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Atrasados</span>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '18px', fontWeight: 700, color: '#EF4444' }}>
                {FINANCIAL.filter(f => f.status === 'overdue').length}
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
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '20px', fontWeight: 700, color: '#A855F7' }}>{COMPETITIONS.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
