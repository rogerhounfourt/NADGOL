import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AvatarAtleta from './AvatarAtleta';
import { reduzirImagem } from '@/lib/foto';

/**
 * Escolher / trocar / remover a foto dentro de um formulário.
 * value: undefined = não mexeu · Blob = nova foto · null = remover a atual.
 */
export default function FotoUpload({ nome, atual, value, onChange }: {
  nome: string; atual?: string | null; value: Blob | null | undefined; onChange: (v: Blob | null | undefined) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [processando, setProcessando] = useState(false);
  const preview = useMemo(() => (value instanceof Blob ? URL.createObjectURL(value) : null), [value]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const exibida = value === null ? null : (preview ?? atual ?? null);
  const temFoto = !!exibida;

  async function escolher(file?: File) {
    if (!file) return;
    setProcessando(true);
    try { onChange(await reduzirImagem(file)); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Não foi possível usar essa imagem.'); }
    finally { setProcessando(false); if (input.current) input.current.value = ''; }
  }

  const botao: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '6px', fontSize: '12px',
    fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', border: '1px solid #2A2A2A', background: '#1A1A1A', color: '#fff',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <AvatarAtleta nome={nome || '?'} foto={exibida} tamanho={84} borda="2px solid #2A2A2A" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => input.current?.click()} disabled={processando} style={{ ...botao, borderColor: '#CC1A1A' }}>
            <Camera size={14} /> {processando ? 'Preparando…' : temFoto ? 'Trocar foto' : 'Adicionar foto'}
          </button>
          {temFoto && (
            <button type="button" onClick={() => onChange(null)} style={{ ...botao, color: 'rgba(255,255,255,0.6)' }}>
              <Trash2 size={14} /> Remover
            </button>
          )}
        </div>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
          Tire na hora ou escolha da galeria. A foto é recortada em quadrado.
        </span>
        <input ref={input} type="file" accept="image/*" hidden onChange={e => void escolher(e.target.files?.[0])} />
      </div>
    </div>
  );
}
