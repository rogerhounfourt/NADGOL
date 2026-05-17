import { useState } from 'react';
import { Brain, Award, TrendingUp } from 'lucide-react';

export default function MindGame() {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const challenges = [
    {
      id: 1,
      situation: 'Você está na lateral direita, o lateral esquerdo está marcado. Qual é a melhor decisão?',
      image: '⚽',
      options: [
        { id: 'A', label: 'Passe para o lateral esquerdo', correct: false },
        { id: 'B', label: 'Drible e cruza', correct: true },
        { id: 'C', label: 'Chuta de longe', correct: false },
      ],
      explanation: 'O drible e cruzamento é a melhor opção quando o lateral está marcado, criando espaço e oportunidade de gol.',
    },
    {
      id: 2,
      situation: 'Você recebe a bola no meio-campo com 3 adversários próximos. O que fazer?',
      image: '🎯',
      options: [
        { id: 'A', label: 'Passe para trás', correct: true },
        { id: 'B', label: 'Tenta driblar os 3', correct: false },
        { id: 'C', label: 'Chuta direto', correct: false },
      ],
      explanation: 'Passar para trás é a decisão defensiva correta quando está cercado, mantendo a posse de bola.',
    },
    {
      id: 3,
      situation: 'Seu time está ganhando 1x0 aos 85 minutos. Qual é a estratégia?',
      image: '🛡️',
      options: [
        { id: 'A', label: 'Ataque agressivo', correct: false },
        { id: 'B', label: 'Defesa compacta', correct: true },
        { id: 'C', label: 'Substituir goleiro', correct: false },
      ],
      explanation: 'Defesa compacta é a estratégia correta para proteger a vantagem no final do jogo.',
    },
  ];

  const challenge = challenges[currentChallenge];

  const handleAnswer = (optionId: string) => {
    if (answered) return;
    
    setSelectedAnswer(optionId);
    setAnswered(true);
    
    const isCorrect = challenge.options.find(opt => opt.id === optionId)?.correct;
    if (isCorrect) {
      setScore(score + 100);
      setCoins(coins + 50);
    }
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(currentChallenge + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: '#0a0a0a', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '32px', fontWeight: 800, color: '#fff', letterSpacing: '2px', margin: 0, marginBottom: '8px' }}>
          NADGOL MIND GAME
        </h1>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          Desenvolva sua inteligência tática através de desafios reais
        </p>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(204,26,26,0.1), rgba(204,26,26,0.05))',
          border: '1px solid rgba(204,26,26,0.2)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Pontuação
          </p>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '24px', fontWeight: 800, color: '#CC1A1A', margin: 0 }}>
            {score}
          </p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,215,0,0.05))',
          border: '1px solid rgba(255,215,0,0.2)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Nadgol Coins
          </p>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '24px', fontWeight: 800, color: '#FFD700', margin: 0 }}>
            {coins}
          </p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,212,255,0.05))',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
            Nível Mental
          </p>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '24px', fontWeight: 800, color: '#00D4FF', margin: 0 }}>
            {Math.floor(score / 300) + 1}
          </p>
        </div>
      </div>

      {/* Challenge Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(204,26,26,0.15), rgba(204,26,26,0.08))',
        border: '2px solid rgba(204,26,26,0.3)',
        borderRadius: '16px',
        padding: '32px',
        backdropFilter: 'blur(10px)',
        marginBottom: '32px',
      }}>
        {/* Progress */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              DESAFIO {currentChallenge + 1} DE {challenges.length}
            </p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: '#CC1A1A', margin: 0, fontWeight: 600 }}>
              {Math.round(((currentChallenge + 1) / challenges.length) * 100)}%
            </p>
          </div>
          <div style={{
            height: '4px',
            background: 'rgba(204,26,26,0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #CC1A1A, #991414)',
              width: `${((currentChallenge + 1) / challenges.length) * 100}%`,
              transition: 'width 300ms ease-out',
            }} />
          </div>
        </div>

        {/* Challenge Content */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>
            {challenge.image}
          </p>
          <h2 style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            color: '#fff',
            margin: 0,
            lineHeight: '1.6',
          }}>
            {challenge.situation}
          </h2>
        </div>

        {/* Options */}
        <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
          {challenge.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrect = option.correct;
            const showResult = answered && isSelected;

            let bgColor = 'rgba(204,26,26,0.1)';
            let borderColor = 'rgba(204,26,26,0.2)';
            let textColor = '#fff';

            if (answered) {
              if (isCorrect) {
                bgColor = 'rgba(34,197,94,0.2)';
                borderColor = 'rgba(34,197,94,0.4)';
                textColor = '#22C55E';
              } else if (isSelected && !isCorrect) {
                bgColor = 'rgba(239,68,68,0.2)';
                borderColor = 'rgba(239,68,68,0.4)';
                textColor = '#EF4444';
              }
            }

            return (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                disabled={answered}
                style={{
                  padding: '16px 20px',
                  background: bgColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: '12px',
                  color: textColor,
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: answered ? 'default' : 'pointer',
                  transition: 'all 150ms',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
                onMouseEnter={(e) => {
                  if (!answered) {
                    e.currentTarget.style.background = 'rgba(204,26,26,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(204,26,26,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!answered) {
                    e.currentTarget.style.background = 'rgba(204,26,26,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(204,26,26,0.2)';
                  }
                }}
              >
                <span style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  flexShrink: 0,
                }}>
                  {option.id}
                </span>
                <span>{option.label}</span>
                {showResult && (
                  <span style={{ marginLeft: 'auto' }}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div style={{
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '12px',
              color: '#00D4FF',
              margin: 0,
              lineHeight: '1.6',
            }}>
              💡 {challenge.explanation}
            </p>
          </div>
        )}

        {/* Next Button */}
        {answered && (
          <button
            onClick={nextChallenge}
            disabled={currentChallenge === challenges.length - 1}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: currentChallenge === challenges.length - 1 ? 'rgba(204,26,26,0.1)' : 'linear-gradient(135deg, #CC1A1A, #991414)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              cursor: currentChallenge === challenges.length - 1 ? 'default' : 'pointer',
              transition: 'all 150ms',
            }}
            onMouseEnter={(e) => {
              if (currentChallenge !== challenges.length - 1) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(204,26,26,0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {currentChallenge === challenges.length - 1 ? '🎉 Desafios Completos!' : 'Próximo Desafio'}
          </button>
        )}
      </div>

      {/* Leaderboard */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(204,26,26,0.1), rgba(204,26,26,0.05))',
        border: '1px solid rgba(204,26,26,0.2)',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 600, color: '#fff', margin: '0 0 16px 0' }}>
          🏆 RANKING MENTAL
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {[
            { rank: 1, name: 'Você', score: 450, medal: '🥇' },
            { rank: 2, name: 'João Silva', score: 380, medal: '🥈' },
            { rank: 3, name: 'Pedro Costa', score: 320, medal: '🥉' },
          ].map((player) => (
            <div key={player.rank} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: player.rank === 1 ? 'rgba(255,215,0,0.1)' : 'rgba(204,26,26,0.05)',
              borderRadius: '8px',
              border: player.rank === 1 ? '1px solid rgba(255,215,0,0.2)' : '1px solid rgba(204,26,26,0.1)',
            }}>
              <span style={{ fontSize: '20px' }}>{player.medal}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: 600, color: '#fff', margin: 0 }}>
                  {player.name}
                </p>
              </div>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '14px', fontWeight: 800, color: '#CC1A1A', margin: 0 }}>
                {player.score} pts
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
