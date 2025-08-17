// 共通ガラスボックスコンポーネント - エレガントで洗練されたデザイン

import { ReactNode } from 'react';

interface GlassBoxProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  focusable?: boolean;
}

const GlassBox = ({ children, className = '', onClick, disabled = false, focusable = false }: GlassBoxProps) => {
  const baseStyles = `
    relative w-full
    ${disabled 
      ? 'bg-white/40 dark:bg-gray-800/40 cursor-not-allowed border border-white/20 dark:border-gray-700/50' 
      : 'bg-white/20 dark:bg-gray-900/20 border border-white/30 dark:border-white/10 hover:bg-white/30 dark:hover:bg-gray-800/30 ring-1 ring-white/20'
    }
    backdrop-blur-xl
    rounded-2xl
    shadow-xl hover:shadow-2xl
    transition-all duration-300
    overflow-hidden
    ${onClick && !disabled ? 'cursor-pointer group' : ''}
    ${focusable ? 'focus-within:shadow-purple-500/20 focus-within:shadow-2xl' : ''}
  `;

  return (
    <div className={`${baseStyles} ${className}`} onClick={disabled ? undefined : onClick}>
      {children}
      
      {/* エレガントなホバーエフェクト（clickableのみ） */}
      {onClick && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
      )}
      
      {/* エレガントなグロウエフェクト（clickableのみ） */}
      {onClick && !disabled && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
      )}
      
      {/* 優しいフォーカスエフェクト（focusableのみ） */}
      {focusable && !disabled && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-purple-400/10 rounded-2xl blur-md opacity-0 focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
      )}
    </div>
  );
};

export default GlassBox;