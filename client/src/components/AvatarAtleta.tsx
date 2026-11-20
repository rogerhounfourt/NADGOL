import { useEffect, useState } from 'react';

/** Foto do atleta (redonda). Sem foto, ou se ela falhar, mostra a inicial no estilo do app. */
export default function AvatarAtleta({ nome, foto, tamanho = 44, ativo = true, borda }: {
  nome: string; foto?: string | null; tamanho?: number; ativo?: boolean; borda?: string;
}) {
  const [falhou, setFalhou] = useState(false);
  useEffect(() => setFalhou(false), [foto]);
  const base: React.CSSProperties = {
    width: tamanho, height: tamanho, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
    border: borda, display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  if (foto && !falhou) {
    return <img src={foto} alt={nome} loading="lazy" onError={() => setFalhou(true)} style={{ ...base, objectFit: 'cover', background: '#1A1A1A' }} />;
  }
  return (
    <div style={{
      ...base, background: ativo ? 'linear-gradient(135deg, #CC1A1A, #991414)' : '#2A2A2A',
      fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: Math.round(tamanho * 0.45), color: '#fff',
    }}>
      {nome.trim().charAt(0).toUpperCase()}
    </div>
  );
}
