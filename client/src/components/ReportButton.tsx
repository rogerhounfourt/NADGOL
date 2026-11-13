import { FileText } from 'lucide-react';

/** Botão padrão "Baixar PDF" (abre o diálogo de impressão para salvar como PDF). */
export default function ReportButton({ onClick, disabled, label = 'Relatório PDF' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title="Gera um PDF para salvar ou compartilhar"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '6px',
        fontSize: '13px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        background: 'transparent', color: '#fff', border: '1px solid #333',
      }}
    >
      <FileText size={16} /> {label}
    </button>
  );
}
