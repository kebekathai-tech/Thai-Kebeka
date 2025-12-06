import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  // Base: Rounded full, font bold, transition transform for "click" effect
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-lg";
  
  const variants = {
    // Primary: Magical Gradient (Purple/Pink/Blue)
    primary: "bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-b-4 border-violet-700 hover:border-violet-800 shadow-violet-200",
    
    // Secondary: White bubble with colored text
    secondary: "bg-white text-violet-600 border-2 border-violet-100 border-b-4 hover:bg-violet-50 shadow-sm",
    
    // Ghost: Transparent but bold
    ghost: "bg-transparent hover:bg-white/50 text-violet-700 hover:text-violet-900 border-2 border-transparent hover:border-white/50",
    
    // Danger: Red/Pink Gradient
    danger: "bg-gradient-to-r from-red-400 to-pink-500 text-white border-b-4 border-red-600 hover:brightness-110"
  };

  const sizes = {
    sm: "text-sm px-4 py-2",
    md: "text-lg px-8 py-3",
    lg: "text-xl px-10 py-4"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};