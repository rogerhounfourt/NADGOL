import { useState, useRef, useEffect } from 'react';
import { Loading, ErrorState } from '@/components/PageState';
import { useChat, useSendMessage } from '@/lib/queries';
import { useApp } from '@/contexts/AppContext';
import { Send, MessageSquare } from 'lucide-react';

const ROLE_COLORS: Record<string, string> = {
  admin: '#A855F7',
  coach: '#3B82F6',
  parent: '#22C55E',
  athlete: '#CC1A1A',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  coach: 'Treinador',
  parent: 'Responsável',
  athlete: 'Atleta',
};

export default function Chat() {
  const { currentUser, demo, escolas } = useApp();
  const chat = useChat();
  const enviar = useSendMessage();
  const messages = chat.data ?? [];
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const texto = input.trim();
    if (!texto || !currentUser || enviar.isPending) return;
    setInput('');
    if (demo) return;
    enviar.mutate(texto, { onError: () => setInput(texto) });
  };

  return (
    <div style={{ padding: '24px', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <div style={{ width: '3px', height: '20px', background: '#CC1A1A', borderRadius: '2px' }} />
        <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Chat Interno
        </h2>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: '#22C55E', background: 'rgba(34,197,94,0.1)', padding: '3px 10px', borderRadius: '4px', marginLeft: '8px' }}>
          ● Ao vivo
        </span>
      </div>

      {/* Messages */}
      <div className="nadgol-card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={14} color="#CC1A1A" />
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            # geral — {currentUser?.escolaNome}
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {chat.isLoading ? <Loading /> : chat.isError ? <ErrorState onRetry={() => chat.refetch()} /> : messages.length === 0 && <p style={{ textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '24px' }}>Nenhuma mensagem ainda. Diga olá!</p>}
          {messages.map((msg, i) => {
            const isMe = msg.senderId === currentUser?.id;
            const color = ROLE_COLORS[msg.senderRole] || '#CC1A1A';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: '10px',
                  opacity: 0,
                  animation: `fadeInUp 0.3s ease-out ${Math.min(i, 10) * 30}ms forwards`,
                }}
              >
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${color}44, ${color}22)`,
                  border: `1px solid ${color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '15px', color: '#fff',
                }}>
                  {msg.senderName.charAt(0)}
                </div>
                <div style={{ maxWidth: '70%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '13px', color: '#fff' }}>{msg.senderName.split(' ')[0]}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color, background: `${color}18`, padding: '1px 6px', borderRadius: '3px' }}>
                      {ROLE_LABELS[msg.senderRole]}
                    </span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>
                      {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{
                    padding: '10px 14px',
                    background: isMe ? 'rgba(204,26,26,0.15)' : '#1A1A1A',
                    border: `1px solid ${isMe ? 'rgba(204,26,26,0.25)' : '#2A2A2A'}`,
                    borderRadius: isMe ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
                  }}>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{msg.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #2A2A2A', display: 'flex', gap: '10px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            maxLength={2000}
            placeholder="Digite sua mensagem..."
            style={{
              flex: 1, padding: '10px 14px',
              background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px',
              color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            onClick={send}
            style={{
              width: '42px', height: '42px',
              background: '#CC1A1A', border: 'none', borderRadius: '6px',
              color: '#fff', cursor: 'pointer', transition: 'all 150ms',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#E02020')}
            onMouseLeave={e => (e.currentTarget.style.background = '#CC1A1A')}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
