import BolaFutebol from './BolaFutebol';

const CSS = `
@keyframes nb-run { from { transform: translateX(-16vw); } to { transform: translateX(116vw); } }
@keyframes nb-hop {
  0%   { transform: translateY(0);    animation-timing-function: cubic-bezier(.2,.7,.4,1); }
  50%  { transform: translateY(-9vh); animation-timing-function: cubic-bezier(.6,0,.8,.3); }
  100% { transform: translateY(0); }
}
@keyframes nb-shadow { 0%,100% { transform: scale(1); opacity: .55; } 50% { transform: scale(.5); opacity: .22; } }
@keyframes nb-spin { to { transform: rotate(360deg); } }
@keyframes nb-spin-back { to { transform: rotate(-360deg); } }
@keyframes nb-shot {
  0%   { transform: translate(0, 0) scale(1); opacity: 1; }
  70%  { transform: translate(0, -52vh) scale(.62); opacity: 1; }
  100% { transform: translate(0, -74vh) scale(.28); opacity: 0; }
}
@keyframes nb-hit {
  0%   { transform: scale(1); filter: drop-shadow(0 0 32px rgba(204,26,26,.5)) drop-shadow(0 8px 24px rgba(0,0,0,.9)); }
  40%  { transform: scale(1.16); filter: drop-shadow(0 0 60px rgba(255,255,255,.9)) drop-shadow(0 0 40px rgba(204,26,26,1)); }
  100% { transform: scale(1); filter: drop-shadow(0 0 32px rgba(204,26,26,.5)) drop-shadow(0 8px 24px rgba(0,0,0,.9)); }
}
@keyframes nb-gol {
  0%   { opacity: 0; transform: translateX(-50%) scale(.4); }
  35%  { opacity: 1; transform: translateX(-50%) scale(1.15); }
  100% { opacity: 0; transform: translateX(-50%) scale(1.5); }
}
@keyframes nb-flicker { 0%,100% { opacity: .9; } 47% { opacity: .75; } 50% { opacity: 1; } 53% { opacity: .8; } }
.nb-hit { animation: nb-hit .6s ease-out .5s both; }
@media (prefers-reduced-motion: reduce) {
  .nb-anim, .nb-hit { animation: none !important; }
  .nb-ball-layer { display: none !important; }
}
`;

/** Cenário de estádio à noite para a tela de login: campo, refletores e uma bola driblando.
 *  `chute` > 0 dispara o chute no escudo (o número só muda a cada tentativa para reiniciar a animação). */
export default function LoginFutebol({ chute }: { chute: number }) {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <style>{CSS}</style>

      {/* refletores */}
      <div className="nb-anim" style={{ position: 'absolute', top: '-12%', left: '-8%', width: '55vw', height: '55vw', maxWidth: 620, maxHeight: 620, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.16) 0%, rgba(255,255,255,0) 68%)', animation: 'nb-flicker 7s infinite' }} />
      <div className="nb-anim" style={{ position: 'absolute', top: '-12%', right: '-8%', width: '55vw', height: '55vw', maxWidth: 620, maxHeight: 620, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.14) 0%, rgba(255,255,255,0) 68%)', animation: 'nb-flicker 9s infinite 1.3s' }} />

      {/* campo em perspectiva */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '48vh', perspective: '520px', WebkitMaskImage: 'linear-gradient(to top, #000 35%, transparent 100%)', maskImage: 'linear-gradient(to top, #000 35%, transparent 100%)' }}>
        <div style={{
          position: 'absolute', left: '-25%', right: '-25%', bottom: 0, height: '120%',
          transformOrigin: 'bottom center', transform: 'rotateX(64deg)',
          background: 'repeating-linear-gradient(90deg, rgba(14,70,34,.55) 0 9%, rgba(8,48,22,.55) 9% 18%)',
        }}>
          <svg viewBox="0 0 400 260" preserveAspectRatio="none" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <g fill="none" stroke="rgba(255,255,255,.42)" strokeWidth="1.6">
              <rect x="10" y="10" width="380" height="240" />
              <line x1="10" y1="130" x2="390" y2="130" />
              <circle cx="200" cy="130" r="38" />
              <rect x="105" y="10" width="190" height="56" />
              <rect x="105" y="194" width="190" height="56" />
              <rect x="152" y="10" width="96" height="22" />
              <rect x="152" y="228" width="96" height="22" />
            </g>
            <circle cx="200" cy="130" r="2.6" fill="rgba(255,255,255,.6)" />
          </svg>
        </div>
      </div>

      {/* bola driblando de ponta a ponta */}
      {chute === 0 && (
        <div className="nb-ball-layer nb-anim" style={{ position: 'absolute', left: 0, bottom: '5vh', animation: 'nb-run 12s linear infinite' }}>
          <div style={{ position: 'relative', width: 44, height: 44 }}>
            <div className="nb-anim" style={{ position: 'absolute', left: 4, bottom: -7, width: 36, height: 9, borderRadius: '50%', background: 'rgba(0,0,0,.65)', filter: 'blur(2px)', animation: 'nb-shadow 1.1s infinite' }} />
            <div className="nb-anim" style={{ animation: 'nb-hop 1.1s infinite' }}>
              <BolaFutebol tamanho={44} giroClasse="nb-anim" />
            </div>
          </div>
        </div>
      )}

      {/* chute no escudo ao entrar */}
      {chute > 0 && (
        <div key={chute} className="nb-ball-layer">
          <div className="nb-anim" style={{ position: 'absolute', left: '50%', bottom: '5vh', marginLeft: -26, animation: 'nb-shot .75s cubic-bezier(.3,.6,.4,1) forwards' }}>
            <BolaFutebol tamanho={52} giroClasse="nb-anim" />
          </div>
          <div className="nb-anim" style={{
            position: 'absolute', top: '9vh', left: '50%', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900,
            fontSize: 'clamp(40px, 9vw, 72px)', letterSpacing: 4, color: '#fff', textShadow: '0 0 24px rgba(204,26,26,.95), 0 4px 12px rgba(0,0,0,.8)',
            opacity: 0, animation: 'nb-gol .9s ease-out .55s forwards',
          }}>GOL!</div>
        </div>
      )}
    </div>
  );
}
