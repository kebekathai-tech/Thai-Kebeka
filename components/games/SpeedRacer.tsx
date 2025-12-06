import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { generatePracticeSentence } from '../../services/geminiService';
import { Language } from '../../types';
import { STRINGS } from '../../constants';

interface GameProps {
  language: Language;
  onBack: () => void;
}

export const SpeedRacer: React.FC<GameProps> = ({ language, onBack }) => {
  const [sentence, setSentence] = useState("");
  const [input, setInput] = useState("");
  const [botProgress, setBotProgress] = useState(0);
  const [userProgress, setUserProgress] = useState(0);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'won' | 'lost'>('loading');
  
  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setBotProgress(prev => {
          if (prev >= 100) {
            setGameState('lost');
            return 100;
          }
          return prev + 0.3; // Bot speed
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  const init = async () => {
    setGameState('loading');
    const text = await generatePracticeSentence(language);
    setSentence(text);
    setInput("");
    setBotProgress(0);
    setUserProgress(0);
    setGameState('playing');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'playing') return;
    const val = e.target.value;
    setInput(val);

    // Calculate progress
    const progress = Math.min(100, (val.length / sentence.length) * 100);
    setUserProgress(progress);

    if (val === sentence) {
      setGameState('won');
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack}>{STRINGS[language].back}</Button>
        <h2 className="text-2xl font-bold">Speed Racer</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 relative overflow-hidden">
        {gameState === 'loading' && <div className="text-center text-gray-500">Preparing Race Track...</div>}
        
        {(gameState === 'won' || gameState === 'lost') && (
           <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center animate-fade-in">
              <div className="text-6xl mb-4">{gameState === 'won' ? '🏆' : '🥈'}</div>
              <h2 className="text-3xl font-bold mb-4">{gameState === 'won' ? 'You Won!' : 'Bot Won!'}</h2>
              <Button onClick={init}>Race Again</Button>
           </div>
        )}

        {gameState !== 'loading' && (
          <div className="space-y-8">
            {/* Track 1: Bot */}
            <div className="relative h-16 bg-gray-100 rounded-lg border-b-4 border-gray-300 flex items-center px-4">
               <div className="absolute left-0 top-0 bottom-0 bg-red-50 w-full opacity-50" style={{width: `${botProgress}%`}}></div>
               <div className="absolute text-4xl transition-all duration-300" style={{left: `calc(${botProgress}% - 30px)`}}>🤖</div>
               <div className="absolute right-2 text-2xl opacity-30">🏁</div>
            </div>

            {/* Track 2: User */}
            <div className="relative h-16 bg-gray-100 rounded-lg border-b-4 border-gray-300 flex items-center px-4">
               <div className="absolute left-0 top-0 bottom-0 bg-green-50 w-full opacity-50" style={{width: `${userProgress}%`}}></div>
               <div className="absolute text-4xl transition-all duration-100" style={{left: `calc(${userProgress}% - 30px)`}}>🏎️</div>
               <div className="absolute right-2 text-2xl opacity-30">🏁</div>
            </div>
            
            <div className="text-center mt-8">
               <p className="text-xl font-medium text-gray-600 mb-2 select-none">{sentence}</p>
               <input 
                 className="w-full text-center text-2xl font-bold border-b-2 border-blue-500 focus:outline-none py-2 bg-transparent text-blue-900"
                 value={input}
                 onChange={handleChange}
                 autoFocus
                 placeholder="Type here to drive!"
                 onPaste={(e) => e.preventDefault()}
               />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};