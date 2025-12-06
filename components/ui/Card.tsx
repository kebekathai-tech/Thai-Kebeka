import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverEffect = false }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        glass-panel rounded-[2rem] p-8
        ${hoverEffect ? 'hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl hover:border-white cursor-pointer transition-all duration-300' : 'shadow-xl'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};