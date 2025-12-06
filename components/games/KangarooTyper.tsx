import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { generateTypingContent } from '../../services/geminiService';
import { Language } from '../../types';
import { STRINGS } from '../../constants';

interface GameProps {
  language: Language;
  onBack: () => void;
}

export const KangarooTyper: React.FC<GameProps> = ({ language, onBack }) => {
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'gameover'>('loading');
  const [score, setScore] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  // Load words
  useEffect(() => {
    startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startGame = async () => {
    setGameState('loading');
    const newWords = await generateTypingContent(language, 'easy', 20);
    setWords(newWords);
    setCurrentWordIndex(0);
    setCurrentInput("");
    setScore(0);
    setGameState('playing');
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentInput(val);

    if (val.trim() === words[currentWordIndex]) {
      // Jump Success
      setIsJumping(true);
      setScore(s => s + 10);
      setCurrentInput("");
      
      setTimeout(() => {
        setIsJumping(false);
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(prev => prev + 1);
        } else {
          // Win/End loop logic - simply restart with harder difficulty in a real app
          // Here we just end for simplicity or could fetch more words
          setGameState('gameover');
        }
      }, 600); // Jump duration
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-4">
        <Button variant="secondary" size="sm" onClick={onBack}>{STRINGS[language].back}</Button>
        <div className="text-xl font-bold text-orange-600">{STRINGS[language].score}: {score}</div>
      </div>

      <div className="relative w-full max-w-4xl h-96 bg-blue-50 rounded-3xl overflow-hidden border-4 border-blue-100 shadow-inner">
        {/* Background Scenery */}
        <div className="absolute bottom-0 w-full h-12 bg-green-300 border-t-4 border-green-400"></div>
        <div className="absolute top-10 left-10 text-6xl opacity-50 animate-pulse">☁️</div>
        <div className="absolute top-20 right-20 text-5xl opacity-40">☁️</div>

        {gameState === 'loading' && <div className="absolute inset-0 flex items-center justify-center text-2xl text-gray-500 font-bold">{STRINGS[language].loading}</div>}
        
        {gameState === 'gameover' && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-20">
             <h2 className="text-4xl font-bold mb-4">Great Job!</h2>
             <p className="text-2xl mb-8">Score: {score}</p>
             <Button onClick={startGame}>{STRINGS[language].playAgain}</Button>
           </div>
        )}

        {gameState === 'playing' && (
          <>
            {/* Kangaroo */}
            <div 
              className={`absolute bottom-12 left-20 text-6xl transition-transform duration-500 ease-in-out z-10 ${isJumping ? '-translate-y-32 rotate-12' : 'translate-y-0'}`}
            >
              🦘
            </div>

            {/* Obstacle / Word Target */}
            <div className="absolute bottom-12 right-1/4 flex flex-col items-center z-10">
               <div className="bg-white px-4 py-2 rounded-xl shadow-lg border-2 border-orange-200 mb-2 font-mono text-xl font-bold text-gray-800">
                  {words[currentWordIndex]}
               </div>
               <div className="text-4xl">🌵</div>
            </div>

            {/* Input Area */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-64">
               <input 
                 type="text" 
                 value={currentInput} 
                 onChange={handleInput} 
                 autoFocus
                 className="w-full px-4 py-2 rounded-full border-2 border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-200 text-center font-bold text-lg shadow-lg bg-white/90"
                 placeholder="Type the word!"
               />
            </div>
          </>
        )}
      </div>
    </div>
  );
};