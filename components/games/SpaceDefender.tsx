import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { generateTypingContent } from '../../services/geminiService';
import { Language } from '../../types';
import { STRINGS } from '../../constants';

interface Asteroid {
  id: number;
  word: string;
  x: number;
  y: number;
}

interface Projectile {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number; // 0 to 1
}

interface GameProps {
  language: Language;
  onBack: () => void;
}

export const SpaceDefender: React.FC<GameProps> = ({ language, onBack }) => {
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'gameover'>('loading');
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    init();
    const interval = setInterval(gameLoop, 50);
    const spawner = setInterval(spawnAsteroid, 2000);
    return () => {
      clearInterval(interval);
      clearInterval(spawner);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, words]);

  const init = async () => {
    if (words.length === 0) {
      const w = await generateTypingContent(language, 'medium', 40);
      setWords(w);
      setGameState('playing');
    }
  };

  const spawnAsteroid = () => {
    if (gameState !== 'playing' || words.length === 0) return;
    const word = words[Math.floor(Math.random() * words.length)];
    const newAsteroid: Asteroid = {
      id: Date.now(),
      word,
      x: Math.random() * 80 + 10,
      y: -10
    };
    setAsteroids(prev => [...prev, newAsteroid]);
  };

  const gameLoop = () => {
    if (gameState !== 'playing') return;

    // Move Asteroids
    setAsteroids(prev => {
      const next = prev.map(a => ({ ...a, y: a.y + 0.3 }));
      // Check collision with base (y > 90) -> Game Over
      if (next.some(a => a.y > 90)) {
        setGameState('gameover');
      }
      return next;
    });

    // Move Projectiles
    setProjectiles(prev => 
      prev.map(p => ({ ...p, progress: p.progress + 0.1 })).filter(p => p.progress < 1)
    );
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    const hitIndex = asteroids.findIndex(a => a.word.toLowerCase() === val.toLowerCase());
    if (hitIndex !== -1) {
      const target = asteroids[hitIndex];
      // Fire projectile
      const proj: Projectile = {
        id: Date.now(),
        startX: 50,
        startY: 100,
        targetX: target.x,
        targetY: target.y,
        progress: 0
      };
      setProjectiles(prev => [...prev, proj]);
      
      // Destroy asteroid
      setAsteroids(prev => prev.filter((_, i) => i !== hitIndex));
      setScore(s => s + 50);
      setInput("");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white p-4 rounded-3xl overflow-hidden relative">
      <div className="flex justify-between items-center z-10">
        <Button variant="secondary" size="sm" onClick={onBack} className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700">{STRINGS[language].back}</Button>
        <div className="text-xl font-bold text-indigo-400">Score: {score}</div>
      </div>

      {/* Game Area */}
      <div className="relative flex-grow w-full overflow-hidden mt-4">
        {/* Stars */}
        <div className="absolute inset-0 opacity-50" style={{backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

        {gameState === 'loading' && <div className="absolute inset-0 flex items-center justify-center text-indigo-400">Initializing Systems...</div>}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
            <h2 className="text-4xl text-red-500 font-bold mb-4">BASE DESTROYED</h2>
            <p className="mb-4">Final Score: {score}</p>
            <Button onClick={() => { setGameState('playing'); setAsteroids([]); setScore(0); }}>Reboot System</Button>
          </div>
        )}

        {/* Asteroids */}
        {asteroids.map(a => (
          <div key={a.id} className="absolute flex flex-col items-center" style={{ left: `${a.x}%`, top: `${a.y}%` }}>
             <div className="text-4xl animate-spin-slow">🪨</div>
             <span className="bg-black/50 px-2 rounded text-sm text-indigo-200 border border-indigo-500/50 mt-1">{a.word}</span>
          </div>
        ))}

        {/* Projectiles */}
        {projectiles.map(p => (
           <div 
             key={p.id}
             className="absolute w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_10px_yellow]"
             style={{
               left: `${p.startX + (p.targetX - p.startX) * p.progress}%`,
               top: `${p.startY + (p.targetY - p.startY) * p.progress}%`
             }}
           />
        ))}

        {/* Base */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-6xl">🚀</div>
      </div>

      <div className="z-10 mt-4 flex justify-center">
         <input
           type="text"
           value={input}
           onChange={handleInput}
           autoFocus
           className="bg-gray-800 border-2 border-indigo-500 text-white px-6 py-2 rounded-full text-center w-full max-w-md focus:outline-none focus:ring-4 focus:ring-indigo-900"
           placeholder="Type to destroy asteroids!"
         />
      </div>
    </div>
  );
};