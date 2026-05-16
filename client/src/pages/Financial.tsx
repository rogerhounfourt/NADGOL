import { useState } from 'react';
import { FINANCIAL, ATHLETES } from '@/lib/data';
import { DollarSign, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

export default function Financial() {
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const records = FINANCIAL.filter(f => filter === 'all' || f.status === filter);
  const paid = FINANCIAL.filter(f => f.status === 'paid').length;
  const pending = FINANCIAL.filter(f => f.status === 'pending').length;
  const overdue = FINANCIAL.filter(f => f.status === 'overdue').length;
  const totalRevenue = FINANCIAL.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);

  const getAthlete = (id: string) => ATHLETES.find(a => a.id === id);

  const getStatusColor = (status: string) => {
    if (status === 'paid') return '#22C55E';
    if (status === 'pending') return '#EAB308';
    if (status === 'overdue') return '#EF4444';
    return '#6B7280';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'paid') return 'Pago';
    if (status === 'pending') return 'Pendente';
    if (status === 'overdue') return 'Atrasado';
    return 'Desconhecido';
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px',
        opacity: 0,
        animation: 'fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0ms forwards',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <img
            src="/manus-storage/68db7c69-d5fd-4129-8544-30bbc90c29b1_1c2e822c.jpg"
            alt="Nadgol Academy Shield"
            style={{ width: '44px', height: 'auto', filter: 'drop-shadow(0 0 16px rgba(204,26,26,0.3))' }}
          />
          <div>
            <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '32px', color: '#fff', letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1, marginBottom: '4px' }}>
              Financeiro
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
              Gestão de mensalidades e pagamentos · Maio 2026
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{
          padding: '20px',
          background: '#111111',
          border: '1px solid #1E1E1E',
          borderRadius: '8px',
          opacity: 0,
          animation: 'fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 50ms forwards',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#22C55E15', border: '1px solid #22C55E30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={22} color="#22C55E" strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Pagos</p>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '24px', fontWeight: 700, color: '#22C55E' }}>{paid}</p>
            </div>
          </div>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>R$ {totalRevenue.toLocaleString('pt-BR')}</p>
        </div>

        <div style={{
          padding: '20px',
          background: '#111111',
          border: '1px solid #1E1E1E',
          borderRadius: '8px',
          opacity: 0,
          animation: 'fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 100ms forwards',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EAB30815', border: '1px solid #EAB30830', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={22} color="#EAB308" strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Pendentes</p>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '24px', fontWeight: 700, color: '#EAB308' }}>{pending}</p>
            </div>
          </div>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Aguardando pagamento</p>
        </div>

        <div style={{
          padding: '20px',
          background: '#111111',
          border: '1px solid #1E1E1E',
          borderRadius: '8px',
          opacity: 0,
          animation: 'fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 150ms forwards',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EF444415', border: '1px solid #EF444430', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={22} color="#EF4444" strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Atrasados</p>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '24px', fontWeight: 700, color: '#EF4444' }}>{overdue}</p>
            </div>
          </div>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Requer atenção urgente</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Filtrar por Status</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'Todos' },
            { key: 'paid', label: 'Pagos' },
            { key: 'pending', label: 'Pendentes' },
            { key: 'overdue', label: 'Atrasados' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              style={{
                padding: '10px 16px',
                background: filter === key ? '#CC1A1A' : '#111111',
                color: filter === key ? '#fff' : 'rgba(255,255,255,0.7)',
                border: `1px solid ${filter === key ? '#CC1A1A' : '#1E1E1E'}`,
                borderRadius: '6px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 200ms ease-out',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => {
                if (filter !== key) {
                  e.currentTarget.style.borderColor = '#2A2A2A';
                  e.currentTarget.style.background = '#1A1A1A';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== key) {
                  e.currentTarget.style.borderColor = '#1E1E1E';
                  e.currentTarget.style.background = '#111111';
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Records List */}
      <div style={{
        padding: '24px',
        background: '#111111',
        border: '1px solid #1E1E1E',
        borderRadius: '8px',
        opacity: 0,
        animation: 'fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 200ms forwards',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <div style={{ width: '3px', height: '18px', background: '#CC1A1A', borderRadius: '2px' }} />
          <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Registros Financeiros
          </h3>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {records.map((rec, idx) => {
            const athlete = getAthlete(rec.athleteId);
            const statusColor = getStatusColor(rec.status);
            return (
              <div
                key={rec.id}
                style={{
                  padding: '16px',
                  background: '#1A1A1A',
                  border: `1px solid ${statusColor}30`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: 0,
                  animation: `fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) ${250 + idx * 30}ms forwards`,
                  transition: 'all 200ms ease-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = statusColor;
                  e.currentTarget.style.background = '#222222';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${statusColor}30`;
                  e.currentTarget.style.background = '#1A1A1A';
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                    {athlete?.name || 'Atleta Desconhecido'}
                  </p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                    {rec.month}/{rec.year} · {rec.paidDate ? new Date(rec.paidDate).toLocaleDateString('pt-BR') : 'Não pago'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
                      R$ {rec.amount.toLocaleString('pt-BR')}
                    </p>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: statusColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {getStatusLabel(rec.status)}
                    </p>
                  </div>

                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: statusColor,
                      boxShadow: `0 0 12px ${statusColor}60`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
