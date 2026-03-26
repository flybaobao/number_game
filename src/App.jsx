import React, { useState, useEffect, useCallback, useRef } from 'react';

let audioContext = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

const playSuccessSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.setValueAtTime(659.25, now + 0.1);
    osc1.frequency.setValueAtTime(783.99, now + 0.2);
    
    osc2.frequency.setValueAtTime(523.25, now);
    osc2.frequency.setValueAtTime(659.25, now + 0.1);
    osc2.frequency.setValueAtTime(783.99, now + 0.2);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  } catch (e) {}
};

const playFailSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) {}
};

const playVictorySound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);
      
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.05);
      gain.gain.linearRampToValueAtTime(0.01, now + i * 0.15 + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.3);
    });
  } catch (e) {}
};

const playCorrectSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.1);
  } catch (e) {}
};

const playWrongSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.setValueAtTime(150, now + 0.1);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {}
};

const MONSTERS = [
  { id: 1, name: '小妖', emoji: '👾', color: '#74b9ff' },
  { id: 2, name: '小怪', emoji: '👻', color: '#a29bfe' },
  { id: 3, name: '中妖', emoji: '👹', color: '#fd79a8' },
  { id: 4, name: '魔兽', emoji: '🐉', color: '#fdcb6e' },
  { id: 5, name: '恶灵', emoji: '🦇', color: '#636e72' },
  { id: 6, name: '巨兽', emoji: '🦖', color: '#00b894' },
  { id: 7, name: '暗黑', emoji: '💀', color: '#2d3436' },
  { id: 8, name: '邪神', emoji: '👺', color: '#d63031' },
  { id: 9, name: 'BOSS', emoji: '😈', color: '#6c5ce7' },
];

const generateQuestions = (level) => {
  const questions = [];
  const base = level;
  const allMultipliers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const shuffled = [...allMultipliers].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);
  
  selected.forEach(multiplier => {
    const correctAnswer = base * multiplier;
    const wrongAnswers = new Set();
    
    while (wrongAnswers.size < 3) {
      const wrong = Math.floor(Math.random() * 81) + 1;
      if (wrong !== correctAnswer) {
        wrongAnswers.add(wrong);
      }
    }
    
    const options = [correctAnswer, ...Array.from(wrongAnswers)].sort(() => Math.random() - 0.5);
    
    questions.push({
      multiplier,
      correctAnswer,
      options,
      selectedAnswer: null,
      isCorrect: null,
    });
  });
  
  return questions;
};

function StartScreen({ onStart }) {
  return (
    <div style={styles.startScreen}>
      <div style={styles.titleContainer}>
        <h1 style={styles.title}>乘法小英雄</h1>
        <p style={styles.subtitle}>击败妖怪，成为乘法大师！</p>
      </div>
      
      <div style={styles.monstersPreview}>
        {MONSTERS.slice(0, 5).map((m, i) => (
          <span key={m.id} style={{ ...styles.previewMonster, animationDelay: `${i * 0.1}s` }}>
            {m.emoji}
          </span>
        ))}
        <span style={styles.previewMonster}>...</span>
      </div>
      
      <button style={styles.startButton} onClick={onStart}>
        开始闯关
      </button>
      
      <p style={styles.ruleText}>共9关，每关3题，全部答对即可过关！</p>
    </div>
  );
}

function GameScreen({ level, questions, questionIndex, onAnswer, feedbackState }) {
  const monster = MONSTERS[level - 1];
  const currentQuestion = questions[questionIndex];
  
  return (
    <div style={styles.gameScreen}>
      <div style={styles.progressSection}>
        <div style={styles.levelInfo}>
          <span style={styles.levelText}>第 {level} 关</span>
          <span style={styles.questionText}>第 {questionIndex + 1}/3 题</span>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${((questionIndex) / 3) * 100}%` }} />
        </div>
      </div>
      
      <div style={styles.monsterArea}>
        <div style={{
          ...styles.monster,
          backgroundColor: monster.color,
          animation: feedbackState === 'correct' ? 'defeat 0.8s forwards' : 'float 2s infinite ease-in-out',
        }}>
          <span style={styles.monsterEmoji}>{monster.emoji}</span>
        </div>
        <p style={styles.monsterName}>{monster.name}</p>
      </div>
      
      <div style={{
        ...styles.questionCard,
        animation: feedbackState === 'correct' ? 'correctPulse 0.5s' : feedbackState === 'wrong' ? 'shake 0.5s' : 'fadeIn 0.3s',
        borderColor: feedbackState === 'correct' ? '#00B894' : feedbackState === 'wrong' ? '#E17055' : '#fff',
      }}>
        <div style={styles.questionTextLarge}>
          {level} × {currentQuestion.multiplier} = ?
        </div>
        
        {feedbackState && (
          <div style={{
            ...styles.feedback,
            color: feedbackState === 'correct' ? '#00B894' : '#E17055',
          }}>
            {feedbackState === 'correct' ? '✓ 回答正确！' : `✗ 正确答案是 ${currentQuestion.correctAnswer}`}
          </div>
        )}
      </div>
      
      <div style={styles.optionsGrid}>
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            style={{
              ...styles.optionButton,
              backgroundColor: feedbackState === 'correct' && option === currentQuestion.correctAnswer ? '#00B894' :
                              feedbackState === 'wrong' && option === currentQuestion.correctAnswer ? '#00B894' :
                              '#fff',
              color: feedbackState && (option === currentQuestion.correctAnswer || (feedbackState === 'correct')) ? '#fff' : '#2D3436',
            }}
            onClick={() => !feedbackState && onAnswer(option)}
            disabled={!!feedbackState}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultScreen({ success, level, onContinue, onRetry }) {
  const monster = MONSTERS[level - 1];
  
  useEffect(() => {
    if (success) {
      playSuccessSound();
    } else {
      playFailSound();
    }
  }, [success]);
  
  return (
    <div style={styles.resultScreen}>
      {success ? (
        <>
          <div style={styles.defeatAnimation}>
            <span style={styles.defeatedMonster}>{monster.emoji}</span>
          </div>
          <h2 style={styles.resultTitle}>🎉 闯关成功！</h2>
          <p style={styles.resultText}>{monster.name} 已被击败！</p>
          <button style={styles.continueButton} onClick={onContinue}>
            下一关
          </button>
        </>
      ) : (
        <>
          <div style={styles.failAnimation}>
            <span style={styles.monsterEmojiLarge}>{monster.emoji}</span>
          </div>
          <h2 style={styles.resultTitleFail}>💪 再来一次！</h2>
          <p style={styles.resultText}>这一关没通过，继续努力！</p>
          <button style={styles.retryButton} onClick={onRetry}>
            重新挑战
          </button>
        </>
      )}
    </div>
  );
}

function VictoryScreen({ onRestart }) {
  const [showTrophy, setShowTrophy] = useState(false);
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    setTimeout(() => setShowTrophy(true), 300);
    
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        color: ['#FFE66D', '#FF6B6B', '#4ECDC4', '#a29bfe'][Math.floor(Math.random() * 4)],
      });
    }
    setParticles(newParticles);
  }, []);
  
  return (
    <div style={styles.victoryScreen}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            ...styles.particle,
            left: `${p.x}%`,
            animationDelay: `${p.delay}s`,
            backgroundColor: p.color,
          }}
        />
      ))}
      
      <h2 style={styles.victoryTitle}>🏆 通关成功！</h2>
      
      <div style={{
        ...styles.trophyContainer,
        opacity: showTrophy ? 1 : 0,
        transform: showTrophy ? 'scale(1)' : 'scale(0)',
        animation: showTrophy ? 'celebrate 0.8s ease-out forwards' : 'none',
      }}>
        <span style={styles.trophy}>🏆</span>
      </div>
      
      <p style={styles.victoryText}>
        恭喜你击败了所有妖怪！<br/>
        成为了真正的乘法大师！
      </p>
      
      <button style={styles.restartButton} onClick={onRestart}>
        重新开始
      </button>
    </div>
  );
}

function App() {
  const [gameState, setGameState] = useState('start');
  const [level, setLevel] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [defeatedMonsters, setDefeatedMonsters] = useState([]);
  const [feedbackState, setFeedbackState] = useState(null);
  
  const startGame = useCallback(() => {
    setLevel(1);
    setQuestionIndex(0);
    setQuestions(generateQuestions(1));
    setDefeatedMonsters([]);
    setFeedbackState(null);
    setGameState('playing');
  }, []);
  
  const handleAnswer = useCallback((answer) => {
    const currentQuestion = questions[questionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
    
    setFeedbackState(isCorrect ? 'correct' : 'wrong');
    
    setTimeout(() => {
      if (isCorrect) {
        if (questionIndex < 2) {
          setQuestionIndex(prev => prev + 1);
          setFeedbackState(null);
        } else {
          setDefeatedMonsters(prev => [...prev, level]);
          setGameState('result');
        }
      } else {
        setGameState('result');
      }
    }, 1200);
  }, [questions, questionIndex, level]);
  
  const handleContinue = useCallback(() => {
    if (level >= 9) {
      setTimeout(() => playVictorySound(), 400);
      setGameState('victory');
    } else {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setQuestionIndex(0);
      setQuestions(generateQuestions(nextLevel));
      setFeedbackState(null);
      setGameState('playing');
    }
  }, [level]);
  
  const handleRetry = useCallback(() => {
    setQuestionIndex(0);
    setQuestions(generateQuestions(level));
    setFeedbackState(null);
    setGameState('playing');
  }, [level]);
  
  const handleRestart = useCallback(() => {
    setGameState('start');
    setLevel(1);
    setQuestionIndex(0);
    setDefeatedMonsters([]);
    setFeedbackState(null);
  }, []);
  
  return (
    <div style={styles.container}>
      {gameState === 'start' && <StartScreen onStart={startGame} />}
      
      {gameState === 'playing' && (
        <GameScreen
          level={level}
          questions={questions}
          questionIndex={questionIndex}
          onAnswer={handleAnswer}
          feedbackState={feedbackState}
        />
      )}
      
      {gameState === 'result' && (
        <ResultScreen
          success={feedbackState === 'correct'}
          level={level}
          onContinue={handleContinue}
          onRetry={handleRetry}
        />
      )}
      
      {gameState === 'victory' && <VictoryScreen onRestart={handleRestart} />}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '480px',
    minHeight: '100vh',
    backgroundColor: '#2C3E50',
    position: 'relative',
    overflow: 'hidden',
  },
  
  startScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '32px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  titleContainer: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '48px',
    color: '#FFE66D',
    textShadow: '3px 3px 0 #FF6B6B, 6px 6px 0 rgba(0,0,0,0.2)',
    marginBottom: '8px',
    animation: 'bounce 2s infinite',
  },
  subtitle: {
    fontSize: '18px',
    color: '#fff',
  },
  monstersPreview: {
    display: 'flex',
    gap: '8px',
    marginBottom: '48px',
    fontSize: '32px',
  },
  previewMonster: {
    animation: 'float 2s infinite ease-in-out',
  },
  startButton: {
    padding: '20px 64px',
    fontSize: '24px',
    fontWeight: 'bold',
    backgroundColor: '#FFE66D',
    color: '#2D3436',
    borderRadius: '16px',
    boxShadow: '0 8px 0 #f39c12, 0 12px 20px rgba(0,0,0,0.3)',
  },
  ruleText: {
    marginTop: '32px',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
  },
  
  gameScreen: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    padding: '16px',
    background: 'linear-gradient(180deg, #2C3E50 0%, #1a252f 100%)',
  },
  progressSection: {
    marginBottom: '16px',
  },
  levelInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  levelText: {
    color: '#FFE66D',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  questionText: {
    color: '#4ECDC4',
    fontSize: '16px',
  },
  progressBar: {
    height: '8px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  monsterArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px',
    marginBottom: '16px',
  },
  monster: {
    width: '120px',
    height: '120px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  monsterEmoji: {
    fontSize: '64px',
  },
  monsterName: {
    marginTop: '12px',
    color: '#fff',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '32px',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    border: '4px solid #fff',
  },
  questionTextLarge: {
    fontSize: '48px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2D3436',
  },
  feedback: {
    textAlign: 'center',
    marginTop: '16px',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginTop: 'auto',
  },
  optionButton: {
    padding: '24px',
    fontSize: '28px',
    fontWeight: 'bold',
    borderRadius: '16px',
    boxShadow: '0 4px 0 #ddd, 0 6px 12px rgba(0,0,0,0.15)',
  },
  
  resultScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '32px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  defeatAnimation: {
    marginBottom: '24px',
  },
  defeatedMonster: {
    fontSize: '80px',
    animation: 'defeat 1s forwards',
  },
  failAnimation: {
    marginBottom: '24px',
  },
  monsterEmojiLarge: {
    fontSize: '80px',
    animation: 'bounce 1s infinite',
  },
  resultTitle: {
    fontSize: '32px',
    color: '#FFE66D',
    marginBottom: '8px',
    textShadow: '2px 2px 0 rgba(0,0,0,0.2)',
  },
  resultTitleFail: {
    fontSize: '32px',
    color: '#FF6B6B',
    marginBottom: '8px',
  },
  resultText: {
    fontSize: '18px',
    color: '#fff',
    marginBottom: '32px',
    textAlign: 'center',
  },
  continueButton: {
    padding: '16px 48px',
    fontSize: '20px',
    fontWeight: 'bold',
    backgroundColor: '#00B894',
    color: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 0 #00a085',
  },
  retryButton: {
    padding: '16px 48px',
    fontSize: '20px',
    fontWeight: 'bold',
    backgroundColor: '#FF6B6B',
    color: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 0 #e55039',
  },
  
  victoryScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '32px 16px',
    background: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 50%, #9b59b6 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    animation: 'bounce 2s infinite',
    top: '-20px',
  },
  victoryTitle: {
    fontSize: '36px',
    color: '#FFE66D',
    marginBottom: '24px',
    textShadow: '3px 3px 0 rgba(0,0,0,0.3)',
    animation: 'glow 2s infinite',
  },
  trophyContainer: {
    width: '160px',
    height: '160px',
    backgroundColor: '#FFE66D',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    boxShadow: '0 0 40px #FFE66D, 0 0 80px rgba(255,230,109,0.5)',
  },
  trophy: {
    fontSize: '80px',
  },
  victoryText: {
    fontSize: '18px',
    color: '#fff',
    textAlign: 'center',
    marginBottom: '32px',
    lineHeight: '1.8',
  },
  restartButton: {
    padding: '16px 48px',
    fontSize: '20px',
    fontWeight: 'bold',
    backgroundColor: '#fff',
    color: '#e74c3c',
    borderRadius: '12px',
    boxShadow: '0 4px 0 #ddd',
  },
};

export default App;
