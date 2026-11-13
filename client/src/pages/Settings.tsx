import { useApp } from '@/contexts/AppContext';
import { NadgolShield } from '@/components/IntroScreen';
import { Settings as SettingsIcon, User, Bell, Shield, Building, Palette, LogOut } from 'lucide-react';

export default function Settings() {
  const { currentUser, setCurrentUser, setShowIntro } = useApp();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="nadgol-card" style={{ padding: '20px', marginBottom: '16px' }}>
      <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '2px', height: '16px', background: '#CC1A1A', borderRadius: '1px' }} />
        {title}
      </h3>
      {children}
    </div>
  );

  const Field = ({ label, value, editable = false }: { label: string; value: string; editable?: boolean }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1E1E1E' }}>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#fff' }}>{value}</p>
        {editable && <button style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: '#CC1A1A', background: 'transparent', border: 'none', cursor: 'pointer' }}>Editar</button>}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '720px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <img
          src="/escudo-nadgol.svg"
          alt="Nadgol Academy Shield"
          style={{ width: '36px', height: 'auto', filter: 'drop-shadow(0 0 10px rgba(204,26,26,0.2))' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '3px', height: '20px', background: '#CC1A1A', borderRadius: '2px' }} />
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Configurações
          </h2>
        </div>
      </div>

      {/* Profile */}
      <Section title="Perfil">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', padding: '16px', background: '#1A1A1A', borderRadius: '8px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #CC1A1A, #991414)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '26px', color: '#fff',
            border: '2px solid rgba(204,26,26,0.4)',
          }}>
            {currentUser?.name.charAt(0)}
          </div>
          <div>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '20px', color: '#fff' }}>{currentUser?.name}</p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#CC1A1A' }}>
              {currentUser?.role === 'admin' ? 'Administrador' : currentUser?.role === 'coach' ? 'Treinador' : currentUser?.role === 'parent' ? 'Responsável' : 'Atleta'}
            </p>
          </div>
        </div>
        <Field label="Nome completo" value={currentUser?.name || ''} editable />
        <Field label="E-mail" value={currentUser?.email || ''} editable />
        <Field label="Função" value={currentUser?.role || ''} />
      </Section>

      {/* Academy */}
      <Section title="Academia">
        <Field label="Nome" value="Nadgol Academy" editable />
        <Field label="Unidades" value="Centro, Norte, Sul, Studio CT" />
        <Field label="Temporada" value="2026" />
        <Field label="Modalidade" value="Futebol de Campo" />
      </Section>

      {/* Notifications */}
      <Section title="Notificações">
        {[
          { label: 'Notificações de treino', enabled: true },
          { label: 'Alertas de pagamento', enabled: true },
          { label: 'Comunicados gerais', enabled: true },
          { label: 'Resultados de jogos', enabled: false },
        ].map(({ label, enabled }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1E1E1E' }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{label}</p>
            <div style={{
              width: '40px', height: '22px', borderRadius: '11px',
              background: enabled ? '#CC1A1A' : '#2A2A2A',
              position: 'relative', cursor: 'pointer', transition: 'background 200ms',
            }}>
              <div style={{
                position: 'absolute', top: '3px',
                left: enabled ? '21px' : '3px',
                width: '16px', height: '16px', borderRadius: '50%',
                background: '#fff', transition: 'left 200ms',
              }} />
            </div>
          </div>
        ))}
      </Section>

      {/* About */}
      <div className="nadgol-card" style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <NadgolShield size={40} />
        </div>
        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '20px', color: '#fff', letterSpacing: '3px' }}>NADGOL ACADEMY</p>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>Versão 1.0.0 · © 2026 Todos os direitos reservados</p>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '4px', fontStyle: 'italic' }}>
          "Formando campeões dentro e fora do campo."
        </p>
      </div>
    </div>
  );
}
