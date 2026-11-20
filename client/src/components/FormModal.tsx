import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'date' | 'number' | 'time' | 'tel' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  half?: boolean;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px',
  color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', outline: 'none', colorScheme: 'dark',
};

/** Modal de formulário no mesmo visual do modal de atleta */
export default function FormModal({ title, fields, submitLabel = 'Salvar', saving, initial, topSlot, onSubmit, onClose }: {
  title: string; fields: FormField[]; submitLabel?: string; saving?: boolean;
  /** Valores iniciais (edição). Campos não tocados saem com o valor inicial. */
  initial?: Record<string, string>;
  /** Conteúdo acima dos campos (ex.: foto) */
  topSlot?: ReactNode;
  onSubmit: (values: Record<string, string>) => void; onClose: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(initial ?? {});
  const set = (k: string, v: string) => setValues(p => ({ ...p, [k]: v }));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} />
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={e => { e.preventDefault(); onSubmit(values); }}
        style={{
          position: 'relative', zIndex: 1, background: '#111111', border: '1px solid #2A2A2A', borderRadius: '8px',
          width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
          animation: 'fadeInUp 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        }}
      >
        <div style={{ padding: '20px', borderBottom: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '3px', height: '20px', background: '#CC1A1A', borderRadius: '2px' }} />
            <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: '22px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {topSlot && <div style={{ padding: '20px 20px 0' }}>{topSlot}</div>}

        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {fields.map(f => (
            <label key={f.name} style={{ gridColumn: f.half ? 'auto' : '1 / -1', display: 'block' }}>
              <span style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                {f.label}{f.required && <span style={{ color: '#CC1A1A' }}> *</span>}
              </span>
              {f.type === 'select' ? (
                <select required={f.required} value={values[f.name] ?? ''} onChange={e => set(f.name, e.target.value)} style={inputStyle}>
                  <option value="">Selecione</option>
                  {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  required={f.required} placeholder={f.placeholder} rows={3}
                  value={values[f.name] ?? ''} onChange={e => set(f.name, e.target.value)}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '70px' }}
                />
              ) : (
                <input
                  type={f.type ?? 'text'} required={f.required} placeholder={f.placeholder}
                  step={f.type === 'number' ? 'any' : undefined} min={f.type === 'number' ? 0 : undefined}
                  value={values[f.name] ?? ''} onChange={e => set(f.name, e.target.value)} style={inputStyle}
                />
              )}
            </label>
          ))}
        </div>

        <div style={{ padding: '0 20px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="nadgol-btn-primary" style={{ padding: '10px 20px', borderRadius: '6px', fontSize: '13px', border: 'none', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Salvando...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
