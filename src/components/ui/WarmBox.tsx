// 温かみのある暖色系ボックスコンポーネント - 安心感のあるデザイン

import { ReactNode } from 'react';

interface WarmBoxProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  focusable?: boolean;
}

const WarmBox = ({ children, className = '', onClick, disabled = false, focusable = false }: WarmBoxProps) => {
  const baseStyles = `
    relative w-full
    bg-warm-gold
    shadow-2xl shadow-warm-gold/30
    rounded-2xl
    transition-all duration-300
    overflow-hidden
    ${disabled 
      ? 'opacity-50 cursor-not-allowed' 
      : 'hover:shadow-3xl hover:shadow-warm-gold/40 hover:-translate-y-1'
    }
    ${onClick && !disabled ? 'cursor-pointer group' : ''}
    ${focusable ? 'focus-within:ring-2 focus-within:ring-warm-orange focus-within:ring-offset-2' : ''}
  `;

  return (
    <div className={`${baseStyles} ${className}`} onClick={disabled ? undefined : onClick}>
      {children}
      
      {/* 温かいホバーエフェクト（clickableのみ） */}
      {onClick && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-warm-yellow/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
      )}
      
      {/* 太陽のようなグロウエフェクト（clickableのみ） */}
      {onClick && !disabled && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-warm-orange/20 via-warm-yellow/20 to-warm-orange/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
      )}
      
      {/* 優しいフォーカスエフェクト（focusableのみ） */}
      {focusable && !disabled && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-warm-orange/10 via-warm-yellow/10 to-warm-orange/10 rounded-2xl blur-md opacity-0 focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
      )}
    </div>
  );
};

export default WarmBox;