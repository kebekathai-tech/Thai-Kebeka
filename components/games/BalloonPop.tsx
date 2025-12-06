import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { generateTypingContent } from '../../services/geminiService';
import { Language } from '../../types';
import { STRINGS } from '../../constants';

interface Balloon {
  id: number;
  word: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100 (100 is bottom)
  speed: number;
  color: string;
}

interface GameProps {
  language: Language;
  onBack: () => void;
}

const COLORS = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];

export const BalloonPop: React.FC<GameProps> = ({ language, onBack }) => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'gameover'>('loading');
  const [wordPool, setWordPool] = useState<string[]>([]);
  
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  const spawnTimerRef = useRef<number>(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initGame();
    return () => {
      cancelAnimationFrame(requestRef.current!);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initGame = async () => {
    setGameState('loading');
    const words = await generateTypingContent(language, 'easy', 50);
    setWordPool(words);
    setGameState('playing');
    setBalloons([]);
    setScore(0);
    setInput("");
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);
  };

  const spawnBalloon = () => {
    if (wordPool.length === 0) return;
    const word = wordPool[Math.floor(Math.random() * wordPool.length)];
    const newBalloon: Balloon = {
      id: Date.now() + Math.random(),
      word,
      x: Math.random() * 80 + 10, // 10% to 90%
      y: 110,
      speed: Math.random() * 10 + 5, // speed
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
    setBalloons(prev => [...prev, newBalloon]);
  };

  const animate = (time: number) => {
    if (gameState !== 'playing') {
       requestRef.current = requestAnimationFrame(animate);
       return;
    }

    const deltaTime = time - (lastTimeRef.current || time);
    lastTimeRef.current = time;

    // Spawn Logic
    spawnTimerRef.current += deltaTime;
    if (spawnTimerRef.current > 2000) { // Spawn every 2 seconds
      spawnBalloon();
      spawnTimerRef.current = 0;
    }

    // Move Balloons
    setBalloons(prev => {
      const nextBalloons = prev.map(b => ({
        ...b,
        y: b.y - (b.speed * deltaTime) / 1000
      })).filter(b => b.y > -20); // Remove if off screen

      // If needed, check if balloons reached top (game over condition)
      // For simplicity, we just let them float away
      return nextBalloons;
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    setInput(val);

    // Check matches
    const matchIndex = balloons.findIndex(b => b.word.toLowerCase() === val);
    if (matchIndex !== -1) {
      // Pop!
      const popped = balloons[matchIndex];
      setBalloons(prev => prev.filter(b => b.id !== popped.id));
      setScore(s => s + 10);
      setInput(""); // Clear input
      // Play pop sound (optional)
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <Button variant="secondary" size="sm" onClick={onBack}>{STRINGS[language].back}</Button>
        <div className="text-xl font-bold text-red-600">{STRINGS[language].score}: {score}</div>
      </div>

      <div 
        ref={gameAreaRef}
        className="relative flex-grow bg-gradient-to-b from-blue-200 to-blue-50 rounded-3xl border-4 border-blue-100 overflow-hidden shadow-inner"
      >
        {gameState === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center text-xl text-blue-800 font-bold">
            Inflating Balloons...
          </div>
        )}

        {balloons.map(b => (
          <div
            key={b.id}
            className={`absolute flex items-center justify-center rounded-full shadow-lg border border-white/20 transition-transform ${b.color}`}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: '100px',
              height: '120px',
            }}
          >
             <div className="absolute bottom-[-10px] w-1 h-8 bg-gray-400/50"></div> {/* String */}
             <span className="text-white font-bold text-lg drop-shadow-md z-10">{b.word}</span>
             <div className="absolute top-4 right-6 w-4 h-8 bg-white/30 rounded-full rotate-45"></div> {/* Shine */}
          </div>
        ))}

        {/* Floating Clouds */}
        <div className="absolute top-10 left-[10%] text-6xl opacity-30 animate-pulse">☁️</div>
        <div className="absolute top-32 right-[20%] text-4xl opacity-20">☁️</div>
      </div>

      <div className="mt-4 flex justify-center">
        <input
           type="text"
           value={input}
           onChange={handleInput}
           autoFocus
           placeholder="Type words to pop balloons!"
           className="px-6 py-3 rounded-full border-2 border-red-300 focus:outline-none focus:ring-4 focus:ring-red-100 shadow-xl text-center text-xl w-96"
        />
      </div>
    </div>
  );
};