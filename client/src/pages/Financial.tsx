import { useState } from 'react';
import { FINANCIAL, ATHLETES } from '@/lib/data';
import { DollarSign, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react';

export default function Financial() {
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const records = FINANCIAL.filter(f => filter === 'all' || f.status === filter);
  const paid = FINANCIAL.filter(f => f.status === 'paid').length;
  const pending = FINANCIAL.filter(f => f.status === 'pending').length;
  const overdue = FINANCIAL.filter(f => f.status === 'overdue').length;
  const totalRevenue = FINANCIAL.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);

  const getAthlete = (id: string) => ATHLETES.find(a => a.id === id);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '3px', height: '20px', background: '#CC1A1A', borderRadius: '2px' }} />
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Controle Financeiro
            </h2>
          </div>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginLeft: '11px' }}>Maio 2026</p>
        </div>
        <button className="nadgol-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '6px', fontSize: '13px' }}>
          <Plus size={16} /> Registrar Pagamento
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Receita Confirmada', value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`, icon: DollarSign, color: '#22C55E' },
          { label: 'Pagamentos OK', value: paid, icon: CheckCircle, color: '#22C55E' },
          { label: 'Pendentes', value: pending, icon: Clock, color: '#EAB308' },
          { label: 'Em Atraso', value: overdue, icon: AlertTriangle, color: '#EF4444' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="nadgol-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Icon size={16} color={color} />
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{label}</span>
            </div>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '28px', color, lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {[
          { key: 'all', label: 'Todos' },
          { key: 'paid', label: 'Pagos' },
          { key: 'pending', label: 'Pendentes' },
          { key: 'overdue', label: 'Em Atraso' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            style={{
              padding: '7px 14px',
              background: filter === key ? '#CC1A1A' : '#111111',
              border: `1px solid ${filter === key ? '#CC1A1A' : '#2A2A2A'}`,
              borderRadius: '6px',
              color: filter === key ? '#fff' : 'rgba(255,255,255,0.5)',
              fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: 500,
              cursor: 'pointer', transition: 'all 150ms',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Records table */}
      <div className="nadgol-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                {['Atleta', 'Mês/Ano', 'Valor', 'Status', 'Pagamento', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((rec, i) => {
                const athlete = getAthlete(rec.athleteId);
                const statusConfig = {
                  paid: { label: 'Pago', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
                  pending: { label: 'Pendente', color: '#EAB308', bg: 'rgba(234,179,8,0.1)' },
                  overdue: { label: 'Atrasado', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
                };
                const sc = statusConfig[rec.status];
                return (
                  <tr key={rec.id} style={{ borderBottom: '1px solid #1A1A1A', opacity: 0, animation: `fadeIn 0.3s ease-out ${i * 40}ms forwards` }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #CC1A1A, #991414)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '14px', color: '#fff' }}>
                          {athlete?.name.charAt(0)}
                        </div>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#fff' }}>{athlete?.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{rec.month}/{rec.year}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff' }}>R$ {rec.amount}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: sc.color, background: sc.bg, padding: '3px 10px', borderRadius: '4px' }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                      {rec.paidDate ? new Date(rec.paidDate).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {rec.status !== 'paid' && (
                        <button style={{ padding: '5px 12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '4px', color: '#22C55E', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', cursor: 'pointer' }}>
                          Marcar Pago
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
