import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { VirtualKeyboard } from '../VirtualKeyboard';
import { generatePracticeSentence, generateShortArticle } from '../../services/geminiService';
import { Language, Difficulty } from '../../types';
import { STRINGS } from '../../constants';

// --- Sound Utility ---
let audioCtx: AudioContext | null = null;

const playTypingSound = (correct: boolean, enabled: boolean) => {
  if (!enabled) return;
  try {
    if (!audioCtx) {
       audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    const now = audioCtx.currentTime;

    if (correct) {
      // Success: Cheerful "Ding" / High Pitch Pop
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1); // Slide up
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.02); // Attack
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); // Decay
      
      osc.start(now);
      osc.stop(now + 0.3);
    } else {
      // Error: Soft "Bonk" / Low Pitch Thud
      // Using a filter to make the error sound less harsh
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.15); // Slide down
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    console.error("Audio error", e);
  }
};

interface BasicPracticeProps {
  language: Language;
  onBack: () => void;
}

type PracticeMode = 'menu' | 'letter' | 'sentence' | 'article';

export const BasicPractice: React.FC<BasicPracticeProps> = ({ language, onBack }) => {
  const [mode, setMode] = useState<PracticeMode>('menu');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => setSoundEnabled(prev => !prev);

  const renderContent = () => {
    switch (mode) {
      case 'letter':
        return <LetterPractice language={language} onBack={() => setMode('menu')} soundEnabled={soundEnabled} toggleSound={toggleSound} />;
      case 'sentence':
        return <TextPractice language={language} mode="sentence" onBack={() => setMode('menu')} soundEnabled={soundEnabled} toggleSound={toggleSound} />;
      case 'article':
        return <TextPractice language={language} mode="article" onBack={() => setMode('menu')} soundEnabled={soundEnabled} toggleSound={toggleSound} />;
      default:
        return <PracticeMenu language={language} onSelect={setMode} onBack={onBack} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col items-center gap-8 animate-fade-in w-full">
      {renderContent()}
    </div>
  );
};

// --- Sub-Component: Practice Menu ---
const PracticeMenu: React.FC<{ language: Language, onSelect: (m: PracticeMode) => void, onBack: () => void }> = ({ language, onSelect, onBack }) => {
  return (
    <>
      <div className="w-full flex justify-between items-center mb-4">
        <Button variant="secondary" onClick={onBack}>← {STRINGS[language].back}</Button>
        <h2 className="text-4xl font-bold text-violet-800 text-shadow">{STRINGS[language].practiceMenu}</h2>
        <div className="w-24"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        <Card hoverEffect onClick={() => onSelect('letter')} className="flex flex-col items-center justify-center p-8 gap-6 min-h-[250px] text-center border-orange-100 bg-orange-50/50">
          <span className="text-7xl drop-shadow-md">🔤</span>
          <h3 className="text-2xl font-bold text-orange-900">{STRINGS[language].letterPractice}</h3>
        </Card>
        <Card hoverEffect onClick={() => onSelect('sentence')} className="flex flex-col items-center justify-center p-8 gap-6 min-h-[250px] text-center border-green-100 bg-green-50/50">
          <span className="text-7xl drop-shadow-md">💬</span>
          <h3 className="text-2xl font-bold text-green-900">{STRINGS[language].sentencePractice}</h3>
        </Card>
        <Card hoverEffect onClick={() => onSelect('article')} className="flex flex-col items-center justify-center p-8 gap-6 min-h-[250px] text-center border-blue-100 bg-blue-50/50">
          <span className="text-7xl drop-shadow-md">📄</span>
          <h3 className="text-2xl font-bold text-blue-900">{STRINGS[language].articlePractice}</h3>
        </Card>
      </div>
    </>
  );
};

// --- Sub-Component: Letter Practice ---
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split('');

interface SubGameProps {
    language: Language;
    onBack: () => void;
    soundEnabled: boolean;
    toggleSound: () => void;
}

const LetterPractice: React.FC<SubGameProps> = ({ language, onBack, soundEnabled, toggleSound }) => {
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [lineIndex, setLineIndex] = useState(0); // 0 to 2 (3 lines)
  const [targetText, setTargetText] = useState("");
  const [input, setInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100 });
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Stats Tracking
  const lineStartRef = useRef<number>(0);
  const lineKeystrokesRef = useRef<number>(0);
  
  const sessionStartRef = useRef<number>(0);
  const sessionKeystrokesRef = useRef<number>(0);
  const sessionCharsRef = useRef<number>(0);

  useEffect(() => {
    if (currentLetter && !isCompleted) {
      generateLine();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLetter, lineIndex, isCompleted]);

  const generateLine = () => {
    if (!currentLetter) return;
    const chars = [];
    for (let i = 0; i < 10; i++) {
       chars.push(Math.random() > 0.5 ? currentLetter.toUpperCase() : currentLetter.toLowerCase());
    }
    setTargetText(chars.join(' '));
    setInput("");
    
    // Reset Line Stats
    lineStartRef.current = Date.now();
    lineKeystrokesRef.current = 0;

    // Reset Session Stats if start
    if (lineIndex === 0) {
      sessionStartRef.current = Date.now();
      sessionKeystrokesRef.current = 0;
      sessionCharsRef.current = 0;
    }

    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelectLetter = (l: string) => {
    setCurrentLetter(l);
    setLineIndex(0);
    setIsCompleted(false);
    setStats({ wpm: 0, accuracy: 100 });
  };

  const handleNextLetter = () => {
     const currIdx = LETTERS.indexOf(currentLetter!);
     const nextIdx = (currIdx + 1) % LETTERS.length;
     handleSelectLetter(LETTERS[nextIdx]);
  };

  const handleRetry = () => {
      handleSelectLetter(currentLetter!);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCompleted) return;
    const val = e.target.value;
    
    // Check if added a character (typing)
    if (val.length > input.length) {
        lineKeystrokesRef.current += 1;
        sessionKeystrokesRef.current += 1;
        
        const expectedChar = targetText[input.length];
        const typedChar = val[val.length - 1];

        // Strict Check
        if (typedChar === expectedChar && targetText.startsWith(val)) {
            playTypingSound(true, soundEnabled);
            setInput(val);
            
            // Check Line Completion
            if (val === targetText) {
                const now = Date.now();
                const lineDurationMin = (now - lineStartRef.current) / 60000;
                const chars = targetText.length;
                
                // Line Stats
                const lineWpm = lineDurationMin > 0 ? Math.round((chars / 5) / lineDurationMin) : 0;
                const lineAcc = Math.round((chars / lineKeystrokesRef.current) * 100);
                
                setStats({ wpm: lineWpm, accuracy: lineAcc });
                
                // Accumulate Session Correct Chars
                sessionCharsRef.current += chars;

                if (lineIndex < 2) {
                    setTimeout(() => {
                        setLineIndex(prev => prev + 1);
                    }, 300);
                } else {
                    // Session Complete
                    const sessionDurationMin = (now - sessionStartRef.current) / 60000;
                    const totalChars = sessionCharsRef.current;
                    const sessionWpm = sessionDurationMin > 0 ? Math.round((totalChars / 5) / sessionDurationMin) : 0;
                    const sessionAcc = sessionKeystrokesRef.current > 0 
                        ? Math.round((totalChars / sessionKeystrokesRef.current) * 100) 
                        : 100;
                    
                    setStats({ wpm: sessionWpm, accuracy: sessionAcc });
                    setIsCompleted(true);
                }
            }
        } else {
            playTypingSound(false, soundEnabled);
            // Incorrect, do not advance input
        }
    }
  };

  const renderText = () => {
     return targetText.split('').map((char, index) => {
      let colorClass = "text-gray-300";
      if (index < input.length) {
        colorClass = "text-emerald-500";
      } else if (index === input.length) {
         colorClass = "text-violet-600 border-b-4 border-violet-500 animate-pulse";
      }
      const isSpace = char === ' ';
      return <span key={index} className={`font-mono text-5xl md:text-7xl transition-all duration-150 ${colorClass} ${isSpace ? 'mx-4' : ''}`}>{char}</span>;
    });
  };

  if (!currentLetter) {
    return (
      <>
        <div className="w-full flex justify-between items-center mb-4">
          <Button variant="secondary" onClick={onBack}>← {STRINGS[language].back}</Button>
          <h2 className="text-4xl font-bold text-violet-800 text-shadow">{STRINGS[language].chooseLetter}</h2>
          <div className="w-24"></div>
        </div>
        <Card className="p-8 md:p-12">
            <div className="grid grid-cols-6 md:grid-cols-9 gap-4">
                {LETTERS.map(l => (
                    <button 
                        key={l}
                        onClick={() => handleSelectLetter(l)}
                        className="w-14 h-14 rounded-2xl bg-white shadow-md border-b-4 border-gray-100 hover:border-b-0 hover:translate-y-1 hover:bg-violet-100 hover:text-violet-600 text-2xl font-bold uppercase transition-all"
                    >
                        {l}
                    </button>
                ))}
            </div>
        </Card>
      </>
    );
  }

  return (
    <>
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setCurrentLetter(null)}>← {STRINGS[language].back}</Button>
            <Button variant="secondary" onClick={toggleSound} className="text-xl px-4" title={soundEnabled ? "Mute" : "Unmute"}>
                {soundEnabled ? "🔊" : "🔇"}
            </Button>
          </div>
          <h2 className="text-4xl font-bold text-violet-800 drop-shadow-md">{currentLetter.toUpperCase()}</h2>
          <div className="flex gap-4 text-base font-bold text-violet-700 bg-white px-6 py-3 rounded-full shadow-lg border-2 border-violet-50">
             <span>{STRINGS[language].wpm}: <span className="text-blue-500">{stats.wpm}</span></span>
             <span>{STRINGS[language].accuracy}: <span className="text-emerald-500">{stats.accuracy}%</span></span>
          </div>
        </div>
        <Card className="w-full flex flex-col items-center gap-12 py-20 relative min-h-[400px]">
            <div className="text-xl text-violet-400 font-bold absolute top-8 right-8 bg-violet-50 px-4 py-2 rounded-full">
                {STRINGS[language].linesCompleted}: {lineIndex}/3
            </div>
            
            <div className="flex flex-wrap justify-center gap-x-1 gap-y-8 max-w-5xl text-center leading-loose">
               {renderText()}
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleChange}
              className="absolute opacity-0 w-full h-full cursor-default"
              autoFocus
            />

            {!isCompleted && (
              <div className="text-gray-400 font-medium">
                {STRINGS[language].typeHere}
              </div>
            )}

            {isCompleted && (
                 <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center animate-fade-in p-8 text-center rounded-[2rem]">
                    <div className="text-8xl mb-4 animate-bounce">🎉</div>
                    <h3 className="text-5xl font-bold mb-8 text-violet-800">{STRINGS[language].excellent}</h3>
                    
                    <div className="flex gap-16 mb-12">
                        <div className="flex flex-col items-center">
                            <span className="text-gray-500 text-lg mb-1 font-bold">{STRINGS[language].accuracy}</span>
                            <span className={`text-7xl font-bold ${stats.accuracy >= 90 ? 'text-green-500' : 'text-orange-500'}`}>{stats.accuracy}%</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-gray-500 text-lg mb-1 font-bold">{STRINGS[language].wpm}</span>
                            <span className="text-7xl font-bold text-blue-500">{stats.wpm}</span>
                        </div>
                    </div>

                    <div className="flex gap-6">
                         <Button variant="secondary" size="lg" onClick={handleRetry}>{STRINGS[language].retry}</Button>
                         <Button variant="primary" size="lg" onClick={handleNextLetter} autoFocus>{STRINGS[language].next} Letter</Button>
                    </div>
                </div>
            )}
        </Card>
        {!isCompleted && <VirtualKeyboard highlightKey={targetText[input.length]} />}
    </>
  );
};

// --- Sub-Component: Text Practice (Sentence/Article) ---
interface TextPracticeProps extends SubGameProps {
    mode: 'sentence' | 'article';
}

const TextPractice: React.FC<TextPracticeProps> = ({ language, mode, onBack, soundEnabled, toggleSound }) => {
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    const [targetText, setTargetText] = useState("");
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [accuracy, setAccuracy] = useState(100);
    const [wpm, setWpm] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        if (!difficulty) return;
        setLoading(true);
        setCompleted(false);
        setInputText("");
        setStartTime(null);
        setAccuracy(100);
        setWpm(0);

        let text = "";
        if (mode === 'sentence') {
            text = await generatePracticeSentence(language, difficulty);
        } else {
            text = await generateShortArticle(language, difficulty);
        }
        setTargetText(text);
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    useEffect(() => {
        if (difficulty) {
          fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [difficulty, mode, language]);

    // Handle Enter key for next level
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (completed && accuracy >= 80 && e.key === 'Enter') {
                fetchData();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [completed, accuracy, difficulty]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (completed) return;
        
        const val = e.target.value;
        if (!startTime) setStartTime(Date.now());
        
        // Sound Logic
        if (val.length > inputText.length) {
            const index = val.length - 1;
            const charTyped = val[index];
            const charTarget = targetText[index];
            
            if (charTyped === charTarget) {
                playTypingSound(true, soundEnabled);
            } else {
                playTypingSound(false, soundEnabled);
            }
        }
        
        setInputText(val);

        if (val.length >= targetText.length) {
            finish(val);
        }
    };

    const finish = (finalInput: string) => {
        setCompleted(true);
        // Calc Accuracy
        let correct = 0;
        for (let i = 0; i < targetText.length; i++) {
            if (finalInput[i] === targetText[i]) correct++;
        }
        const acc = Math.round((correct / targetText.length) * 100);
        setAccuracy(acc);

        // Calc WPM
        if (startTime) {
             const timeMin = (Date.now() - startTime) / 60000;
             const words = finalInput.length / 5;
             const speed = timeMin > 0 ? Math.round(words / timeMin) : 0;
             setWpm(speed);
        }
    };

    const renderText = () => {
        return targetText.split('').map((char, index) => {
          let colorClass = "text-gray-300";
          if (index < inputText.length) {
            colorClass = inputText[index] === char ? "text-emerald-500" : "text-red-400 bg-red-50 rounded";
          } else if (index === inputText.length) {
            colorClass = "text-violet-600 border-b-4 border-violet-500 animate-pulse";
          }
          
          const isSpace = char === ' ';
          // Consistent font size and word spacing logic
          return <span key={index} className={`font-mono text-5xl md:text-6xl transition-colors ${colorClass} ${isSpace ? 'mx-4' : ''}`}>{char}</span>;
        });
    };

    if (!difficulty) {
       return (
         <>
          <div className="w-full flex justify-between items-center mb-4">
            <Button variant="secondary" onClick={onBack}>← {STRINGS[language].back}</Button>
            <h2 className="text-4xl font-bold text-violet-800 text-shadow">{STRINGS[language].selectDifficulty}</h2>
            <div className="w-24"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
             <Card hoverEffect onClick={() => setDifficulty('easy')} className="flex flex-col items-center justify-center p-12 gap-6 text-center cursor-pointer bg-green-50/60 border-green-200">
                <span className="text-7xl animate-bounce-hover">🐣</span>
                <h3 className="text-3xl font-bold text-green-700">{STRINGS[language].easy}</h3>
                <p className="text-green-600 font-medium">{mode === 'sentence' ? "Short sentences" : "Short paragraphs"}</p>
             </Card>
             <Card hoverEffect onClick={() => setDifficulty('medium')} className="flex flex-col items-center justify-center p-12 gap-6 text-center cursor-pointer bg-yellow-50/60 border-yellow-200">
                <span className="text-7xl animate-bounce-hover">🦅</span>
                <h3 className="text-3xl font-bold text-yellow-700">{STRINGS[language].medium}</h3>
                <p className="text-yellow-600 font-medium">{mode === 'sentence' ? "Medium sentences" : "Medium paragraphs"}</p>
             </Card>
             <Card hoverEffect onClick={() => setDifficulty('hard')} className="flex flex-col items-center justify-center p-12 gap-6 text-center cursor-pointer bg-red-50/60 border-red-200">
                <span className="text-7xl animate-bounce-hover">🦁</span>
                <h3 className="text-3xl font-bold text-red-700">{STRINGS[language].hard}</h3>
                <p className="text-red-600 font-medium">{mode === 'sentence' ? "Long sentences" : "Long paragraphs"}</p>
             </Card>
          </div>
         </>
       )
    }

    return (
        <>
            <div className="w-full flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={() => setDifficulty(null)}>← {STRINGS[language].back}</Button>
                    <Button variant="secondary" onClick={toggleSound} className="text-xl px-4" title={soundEnabled ? "Mute" : "Unmute"}>
                        {soundEnabled ? "🔊" : "🔇"}
                    </Button>
                </div>
                <div className="flex flex-col items-center">
                   <h2 className="text-4xl font-bold text-violet-800 text-shadow">{mode === 'sentence' ? STRINGS[language].sentencePractice : STRINGS[language].articlePractice}</h2>
                   <span className="text-sm font-bold uppercase tracking-wider text-violet-500 bg-white px-3 py-1 rounded-full shadow-sm mt-1">{STRINGS[language][difficulty]}</span>
                </div>
                <div className="w-24"></div>
            </div>

            <Card className="w-full flex flex-col items-center gap-8 py-16 min-h-[350px] justify-center relative overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl animate-spin">🪄</div>
                        <div className="text-xl font-bold text-violet-500">{STRINGS[language].loading}</div>
                    </div>
                ) : (
                    <>
                         {/* Standardized gap-x-1 for character spacing */}
                         <div className={`flex flex-wrap gap-x-1 gap-y-6 ${mode === 'article' ? 'text-left max-w-5xl justify-start leading-loose' : 'text-center justify-center max-w-5xl leading-loose'}`}>
                            {renderText()}
                         </div>
                         
                         {!completed && (
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputText}
                                onChange={handleChange}
                                className="absolute opacity-0 w-full h-full cursor-default"
                                autoFocus
                            />
                         )}

                         {completed && (
                            <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center animate-fade-in p-6 text-center rounded-[2rem]">
                                <div className="text-7xl mb-4 animate-bounce">
                                    {accuracy >= 80 ? '🌟' : '💪'}
                                </div>
                                <h3 className="text-4xl font-bold mb-8 text-violet-800">{accuracy >= 80 ? STRINGS[language].excellent : "Keep Practicing!"}</h3>
                                
                                <div className="flex gap-16 mb-10">
                                    <div className="flex flex-col items-center">
                                        <span className="text-gray-500 text-lg mb-1 font-bold">Accuracy</span>
                                        <span className={`text-6xl font-bold ${accuracy >= 80 ? 'text-green-500' : 'text-red-500'}`}>{accuracy}%</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-gray-500 text-lg mb-1 font-bold">WPM</span>
                                        <span className="text-6xl font-bold text-blue-500">{wpm}</span>
                                    </div>
                                </div>

                                {accuracy >= 80 ? (
                                    <div className="flex flex-col gap-4">
                                         <Button size="lg" onClick={fetchData} autoFocus>{STRINGS[language].next}</Button>
                                         <span className="text-sm text-gray-400 font-medium">{STRINGS[language].pressEnter}</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <p className="text-red-400 font-bold text-lg mb-2">{STRINGS[language].lowAccuracy}</p>
                                        <Button variant="secondary" onClick={() => { setCompleted(false); setInputText(""); setStartTime(null); inputRef.current?.focus(); }}>{STRINGS[language].retry}</Button>
                                    </div>
                                )}
                            </div>
                         )}
                    </>
                )}
            </Card>
            
            {!completed && !loading && mode === 'sentence' && (
                <VirtualKeyboard highlightKey={targetText[inputText.length]} />
            )}
        </>
    );
};