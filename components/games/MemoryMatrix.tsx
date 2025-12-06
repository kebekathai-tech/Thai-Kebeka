import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { generateTypingContent } from '../../services/geminiService';
import { Language } from '../../types';
import { STRINGS } from '../../constants';

interface GameProps {
  language: Language;
  onBack: () => void;
}

export const MemoryMatrix: React.FC<GameProps> = ({ language, onBack }) => {
  const [currentWord, setCurrentWord] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'typing' | 'result'>('idle');
  const [message, setMessage] = useState("");

  const startLevel = async () => {
    setMessage("Memorize this!");
    setGameState('showing');
    setInput("");
    
    // Generate word based on level
    const diff = level < 3 ? 'easy' : level < 6 ? 'medium' : 'hard';
    const words = await generateTypingContent(language, diff, 1);
    const word = words[0] || (language === Language.ENGLISH ? "memory" : "记忆");
    
    setCurrentWord(word);
    setIsVisible(true);

    // Hide time decreases as level increases
    const hideTime = Math.max(1000, 3000 - (level * 200)); 
    
    setTimeout(() => {
      setIsVisible(false);
      setGameState('typing');
      setMessage("Type it now!");
    }, hideTime);
  };

  const checkResult = () => {
    if (input.trim().toLowerCase() === currentWord.toLowerCase()) {
      setScore(s => s + (level * 10));
      setLevel(l => l + 1);
      setMessage("Correct! Get ready for next level...");
      setGameState('result');
      setTimeout(startLevel, 2000);
    } else {
      setMessage(`Wrong! It was "${currentWord}". Game Over.`);
      setGameState('result');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') checkResult();
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      <div className="flex justify-between w-full">
        <Button variant="ghost" onClick={onBack}>{STRINGS[language].back}</Button>
        <div className="text-xl font-bold text-purple-600">Level: {level} | Score: {score}</div>
      </div>

      <div className="w-full aspect-video bg-gray-900 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-center relative overflow-hidden border-4 border-gray-800">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        
        {gameState === 'idle' && (
          <Button size="lg" onClick={() => { setScore(0); setLevel(1); startLevel(); }}>Start Memory Game</Button>
        )}

        {gameState === 'showing' && (
          <div className={`text-5xl md:text-7xl font-bold text-white transition-opacity duration-300 ${isVisible ? 'opacity-100 scale-110' : 'opacity-0 scale-90'}`}>
            {currentWord}
          </div>
        )}

        {gameState === 'typing' && (
          <div className="flex flex-col gap-4 w-full max-w-md z-10">
            <input 
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-gray-800 text-white text-3xl text-center py-3 rounded-xl border-2 border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-900"
              placeholder="?"
            />
            <Button onClick={checkResult} className="w-full">Submit</Button>
          </div>
        )}

        {gameState === 'result' && (
          <div className="z-10 flex flex-col items-center gap-4">
             <div className="text-2xl text-white font-medium">{message}</div>
             {message.includes("Game Over") && (
               <Button onClick={() => { setScore(0); setLevel(1); startLevel(); }}>Try Again</Button>
             )}
          </div>
        )}
      </div>
      
      <div className="text-gray-500 text-sm">
        {gameState === 'showing' ? "Memorize the word..." : gameState === 'typing' ? "Type the word and press Enter." : ""}
      </div>
    </div>
  );
};