import { useState } from 'react';
import { NOTIFICATIONS } from '@/lib/data';
import { Bell, Dumbbell, Trophy, DollarSign, Megaphone, ClipboardCheck, Calendar, Plus } from 'lucide-react';

const TYPE_CONFIG = {
  training: { icon: Dumbbell, color: '#3B82F6', label: 'Treino' },
  game: { icon: Trophy, color: '#CC1A1A', label: 'Jogo' },
  payment: { icon: DollarSign, color: '#EAB308', label: 'Pagamento' },
  announcement: { icon: Megaphone, color: '#A855F7', label: 'Comunicado' },
  evaluation: { icon: ClipboardCheck, color: '#22C55E', label: 'Avaliação' },
  event: { icon: Calendar, color: '#F97316', label: 'Evento' },
};

export default function Notifications() {
  const [notifs, setNotifs] = useState(NOTIFICATIONS);

  const markRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '3px', height: '20px', background: '#CC1A1A', borderRadius: '2px' }} />
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Notificações
            </h2>
          </div>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginLeft: '11px' }}>
            {notifs.filter(n => !n.read).length} não lidas
          </p>
        </div>
        <button className="nadgol-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '6px', fontSize: '13px' }}>
          <Plus size={16} /> Nova Notificação
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notifs.map((notif, i) => {
          const tc = TYPE_CONFIG[notif.type];
          const Icon = tc.icon;
          return (
            <div
              key={notif.id}
              className="nadgol-card"
              style={{
                padding: '16px',
                borderLeft: `2px solid ${notif.read ? '#2A2A2A' : tc.color}`,
                opacity: 0,
                animation: `fadeInUp 0.4s cubic-bezier(0.23, 1, 0.32, 1) ${i * 60}ms forwards`,
                cursor: 'pointer',
              }}
              onClick={() => markRead(notif.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
                  background: `${tc.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color={tc.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '14px', color: '#fff' }}>{notif.title}</h3>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: tc.color, background: `${tc.color}18`, padding: '2px 8px', borderRadius: '4px' }}>
                      {tc.label}
                    </span>
                    {!notif.read && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#CC1A1A', flexShrink: 0 }} />
                    )}
                  </div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{notif.message}</p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '8px' }}>
                    {new Date(notif.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
