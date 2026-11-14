const MOLA = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

/** Bola de futebol vermelha e preta (SVG). `giroClasse` permite girar só os gomos por CSS; o brilho fica parado. */
export default function BolaFutebol({ girar = 0, tamanho = 50, giroClasse, transicao = true }: { girar?: number; tamanho?: number; giroClasse?: string; transicao?: boolean }) {
  return (
    <span style={{ position: 'relative', display: 'block', width: `${tamanho}px`, height: `${tamanho}px` }} aria-hidden>
      {/* camada que gira: gomos pretos e costuras */}
      <svg viewBox="0 0 100 100" width={tamanho} height={tamanho} className={giroClasse} style={{ position: 'absolute', inset: 0, ...(giroClasse ? { animation: 'nb-spin 1.1s linear infinite' } : { transform: `rotate(${girar}deg)`, transition: transicao ? `transform 520ms ${MOLA}` : undefined }) }}>
        <defs>
          <radialGradient id="bolaVermelho" cx="50%" cy="50%" r="55%">
            <stop offset="0" stopColor="#D42A2A" />
            <stop offset="1" stopColor="#A81616" />
          </radialGradient>
          <linearGradient id="bolaPreto" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2b2b2b" />
            <stop offset="1" stopColor="#050505" />
          </linearGradient>
          <clipPath id="bolaRecorte"><circle cx="50" cy="50" r="49" /></clipPath>
        </defs>
        <circle cx="50" cy="50" r="49" fill="url(#bolaVermelho)" />
        <g clipPath="url(#bolaRecorte)" strokeLinejoin="round">
          <path d="M50.0 29.0L50.0 17.0M66.2 5.3L87.6 20.8M70.0 43.5L81.4 39.8M97.6 51.5L89.4 76.7M62.3 67.0L69.4 76.7M63.2 95.7L36.8 95.7M37.7 67.0L30.6 76.7M10.6 76.7L2.4 51.5M30.0 43.5L18.6 39.8M12.4 20.8L33.8 5.3" stroke="#5E0909" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <g stroke="#000" strokeWidth="1.2"><polygon points="50.0,29.0 70.0,43.5 62.3,67.0 37.7,67.0 30.0,43.5" fill="url(#bolaPreto)" /><polygon points="50.0,17.0 33.8,5.3 40.0,-13.8 60.0,-13.8 66.2,5.3" fill="url(#bolaPreto)" /><polygon points="81.4,39.8 87.6,20.8 107.5,20.8 113.7,39.8 97.6,51.5" fill="url(#bolaPreto)" /><polygon points="69.4,76.7 89.4,76.7 95.6,95.7 79.4,107.5 63.2,95.7" fill="url(#bolaPreto)" /><polygon points="30.6,76.7 36.8,95.7 20.6,107.5 4.4,95.7 10.6,76.7" fill="url(#bolaPreto)" /><polygon points="18.6,39.8 2.4,51.5 -13.7,39.8 -7.5,20.8 12.4,20.8" fill="url(#bolaPreto)" /></g>
        </g>
      </svg>
      {/* camada fixa: volume, brilho e borda (não gira) */}
      <svg viewBox="0 0 100 100" width={tamanho} height={tamanho} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="bolaSombra" cx="36%" cy="30%" r="78%">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.55" stopColor="#000" stopOpacity="0.08" />
            <stop offset="1" stopColor="#000" stopOpacity="0.6" />
          </radialGradient>
          <linearGradient id="bolaBrilho" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="49" fill="url(#bolaSombra)" />
        <ellipse cx="36" cy="24" rx="19" ry="11" transform="rotate(-32 36 24)" fill="url(#bolaBrilho)" opacity="0.55" />
        <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" />
      </svg>
    </span>
  );
}
