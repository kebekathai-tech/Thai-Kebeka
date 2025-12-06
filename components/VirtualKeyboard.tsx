import React from 'react';

interface VirtualKeyboardProps {
  highlightKey?: string;
}

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ highlightKey }) => {
  const isMatch = (key: string) => highlightKey?.toLowerCase() === key.toLowerCase();

  return (
    <div className="flex flex-col items-center gap-3 mt-10 select-none pointer-events-none transform scale-90 md:scale-100 origin-top p-6 bg-white/40 backdrop-blur-sm rounded-3xl border-2 border-white/50 shadow-xl">
      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2 md:gap-3">
          {row.map((key) => (
            <div
              key={key}
              className={`
                w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-2xl text-lg md:text-2xl font-bold uppercase shadow-[0_4px_0_rgba(0,0,0,0.1)] transition-all duration-200
                ${isMatch(key) 
                  ? 'bg-gradient-to-b from-yellow-300 to-orange-400 text-white transform translate-y-1 shadow-none border-b-0' 
                  : 'bg-white text-gray-600 border-b-4 border-gray-200'}
              `}
            >
              {key}
            </div>
          ))}
        </div>
      ))}
      {/* Space bar */}
      <div className="flex gap-2">
        <div 
          className={`
            w-64 h-12 md:h-14 rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.1)] transition-all duration-200
            ${highlightKey === ' ' 
              ? 'bg-gradient-to-b from-yellow-300 to-orange-400 transform translate-y-1 shadow-none' 
              : 'bg-white border-b-4 border-gray-200'}
          `}
        >
            <div className={`w-full h-full flex items-center justify-center text-gray-300 font-bold ${highlightKey === ' ' ? 'text-white' : ''}`}>SPACE</div>
        </div>
      </div>
    </div>
  );
};