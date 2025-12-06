import React, { useState } from 'react';
import { AppMode, Language, GameConfig } from './types';
import { STRINGS, GAMES } from './constants';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { BasicPractice } from './components/games/BasicPractice';
import { KangarooTyper } from './components/games/KangarooTyper';
import { BalloonPop } from './components/games/BalloonPop';
import { SpaceDefender } from './components/games/SpaceDefender';
import { SpeedRacer } from './components/games/SpeedRacer';
import { MemoryMatrix } from './components/games/MemoryMatrix';

const App = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);

  const renderContent = () => {
    switch (mode) {
      case AppMode.BASIC_PRACTICE:
        return <BasicPractice language={language} onBack={() => setMode(AppMode.HOME)} />;
      case AppMode.GAME_KANGAROO:
        return <KangarooTyper language={language} onBack={() => setMode(AppMode.GAME_MENU)} />;
      case AppMode.GAME_BALLOON:
        return <BalloonPop language={language} onBack={() => setMode(AppMode.GAME_MENU)} />;
      case AppMode.GAME_SPACE:
        return <SpaceDefender language={language} onBack={() => setMode(AppMode.GAME_MENU)} />;
      case AppMode.GAME_RACER:
        return <SpeedRacer language={language} onBack={() => setMode(AppMode.GAME_MENU)} />;
      case AppMode.GAME_MEMORY:
        return <MemoryMatrix language={language} onBack={() => setMode(AppMode.GAME_MENU)} />;
      case AppMode.GAME_MENU:
        return (
          <div className="flex flex-col gap-8 animate-fade-in w-full max-w-6xl mx-auto">
             <div className="flex items-center justify-between">
                <Button variant="secondary" onClick={() => setMode(AppMode.HOME)}>← {STRINGS[language].back}</Button>
                <h2 className="text-4xl font-bold text-violet-800 text-shadow">{STRINGS[language].selectGame}</h2>
                <div className="w-24"></div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
                {GAMES.map((game) => (
                  <Card 
                    key={game.id} 
                    hoverEffect={true} 
                    onClick={() => setMode(game.id)}
                    className="flex flex-col items-center text-center gap-4 relative overflow-hidden group"
                  >
                    {/* Decorative Background Blob */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 ${game.color.replace('text', 'bg').split(' ')[0]}`}></div>
                    
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-lg mb-2 transform group-hover:scale-110 transition-transform duration-300 ${game.color}`}>
                      {game.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{game.name}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{game.description}</p>
                    <div className="flex-grow"></div>
                    <Button size="sm" className="mt-4 w-full">{STRINGS[language].start}</Button>
                  </Card>
                ))}
             </div>
          </div>
        );
      case AppMode.HOME:
      default:
        return (
          <div className="flex flex-col items-center gap-12 mt-8 animate-fade-in">
            <div className="text-center space-y-6 relative">
              {/* Decorative Stars */}
              <div className="absolute -top-10 -left-20 text-6xl animate-bounce hidden md:block">✨</div>
              <div className="absolute top-10 -right-24 text-6xl animate-bounce hidden md:block" style={{animationDelay: '1s'}}>🌟</div>
              
              <h1 className="text-6xl md:text-8xl font-bold text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.2)]" style={{ WebkitTextStroke: '2px #8b5cf6' }}>
                {STRINGS[language].appTitle}
              </h1>
              <p className="text-2xl text-violet-800 font-bold max-w-xl mx-auto tracking-wide">
                {STRINGS[language].tagline}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl px-4">
              <Card 
                hoverEffect={true} 
                onClick={() => setMode(AppMode.BASIC_PRACTICE)}
                className="flex flex-col items-center justify-center gap-6 py-16 bg-gradient-to-br from-white to-blue-50 border-blue-100"
              >
                <div className="w-28 h-28 bg-blue-100 rounded-full flex items-center justify-center text-6xl shadow-inner mb-2 animate-float">⌨️</div>
                <h3 className="text-3xl font-bold text-blue-900">{STRINGS[language].startPractice}</h3>
                <p className="text-gray-500 font-medium text-center px-8">Practice letters, sentences, and articles.</p>
                <Button variant="primary" size="lg" className="w-full max-w-xs bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 border-blue-600">{STRINGS[language].start}</Button>
              </Card>

              <Card 
                hoverEffect={true} 
                onClick={() => setMode(AppMode.GAME_MENU)}
                className="flex flex-col items-center justify-center gap-6 py-16 bg-gradient-to-br from-white to-purple-50 border-purple-100"
              >
                <div className="w-28 h-28 bg-purple-100 rounded-full flex items-center justify-center text-6xl shadow-inner mb-2 animate-float" style={{animationDelay: '1.5s'}}>🎮</div>
                <h3 className="text-3xl font-bold text-purple-900">{STRINGS[language].miniGames}</h3>
                <p className="text-gray-500 font-medium text-center px-8">Play 5 fun games like Kangaroo Jump!</p>
                <Button variant="primary" size="lg" className="w-full max-w-xs">{STRINGS[language].start}</Button>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-pink-200 selection:text-pink-900 pb-20">
      <nav className="fixed top-0 w-full bg-white/60 backdrop-blur-md border-b-2 border-white/50 z-50 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="text-2xl font-bold flex items-center gap-3 cursor-pointer group" onClick={() => setMode(AppMode.HOME)}>
          <span className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white rounded-xl p-2 text-xl shadow-lg group-hover:rotate-12 transition-transform">TG</span>
          <span className="text-violet-800 hidden sm:block">{STRINGS[language].appTitle}</span>
        </div>
        <div className="flex bg-white/80 p-1.5 rounded-full border-2 border-white shadow-inner">
          <button 
            onClick={() => setLanguage(Language.ENGLISH)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${language === Language.ENGLISH ? 'bg-gradient-to-r from-violet-400 to-fuchsia-400 text-white shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}
          >
            English
          </button>
          <button 
            onClick={() => setLanguage(Language.CHINESE)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${language === Language.CHINESE ? 'bg-gradient-to-r from-violet-400 to-fuchsia-400 text-white shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}
          >
            中文
          </button>
        </div>
      </nav>

      <main className="pt-28 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;