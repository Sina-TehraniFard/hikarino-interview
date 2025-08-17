// ボタンコンポーネント

import { ReactNode, useState } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "magical";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  className?: string;
}

const Button = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  className = "",
}: ButtonProps) => {
  const [isClicked, setIsClicked] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !onClick) return;

    // リップルエフェクトの座標計算
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);
    setIsClicked(true);

    // クリックアニメーション
    setTimeout(() => setIsClicked(false), 600);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 1000);

    onClick();
  };

  const baseClasses = "relative overflow-hidden font-semibold transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed group";
  
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600
      hover:from-purple-600 hover:via-purple-700 hover:to-indigo-700
      text-white shadow-lg hover:shadow-2xl
      border border-purple-400/20
      before:absolute before:inset-0 
      before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
      before:translate-x-[-200%] hover:before:translate-x-[200%]
      before:transition-transform before:duration-700
      ${isClicked ? 'scale-95 shadow-inner' : 'hover:scale-105'}
    `,
    secondary: `
      bg-white/40 dark:bg-gray-900/40 backdrop-blur-md
      border-2 border-purple-300/50 dark:border-purple-600/50
      text-purple-700 dark:text-purple-300
      hover:bg-white/60 dark:hover:bg-gray-800/60
      shadow-lg hover:shadow-xl
      hover:border-purple-400 dark:hover:border-purple-500
      ${isClicked ? 'scale-95' : 'hover:scale-105'}
    `,
    magical: `
      bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600
      hover:from-violet-700 hover:via-purple-700 hover:to-pink-700
      text-white shadow-lg hover:shadow-2xl
      border border-white/20
      animate-gradient bg-[length:200%_200%]
      before:absolute before:inset-0
      before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
      before:translate-x-[-200%] hover:before:translate-x-[200%]
      before:transition-transform before:duration-1000
      after:absolute after:inset-0 after:opacity-0 hover:after:opacity-100
      after:bg-gradient-to-t after:from-white/0 after:via-white/10 after:to-white/0
      after:transition-opacity after:duration-300
      ${isClicked ? 'scale-95 shadow-inner' : 'hover:scale-105'}
    `
  };
  
  const sizeClasses = {
    small: "px-5 py-2.5 text-sm rounded-lg",
    medium: "px-7 py-3.5 text-base rounded-xl",
    large: "px-9 py-4.5 text-lg rounded-2xl",
  };
  
  const widthClasses = fullWidth ? "w-full max-w-md" : "";
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={classes}
    >
      {/* マルチレイヤーグロウエフェクト */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-[-2px] bg-gradient-to-r from-purple-600/50 via-pink-500/50 to-purple-600/50 rounded-2xl blur-lg animate-pulse" />
      </div>

      {/* リップルエフェクト */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/40 rounded-full pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '10px',
            height: '10px',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* 粒子エフェクト */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {variant === 'magical' && [...Array(6)].map((_, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 animate-float-particle"
            style={{
              left: `${20 + i * 12}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${2 + i * 0.3}s`
            }}
          />
        ))}
      </div>

      {/* 内部シャドウとハイライト */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl" />
      </div>
      
      {/* ボタンコンテンツ */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {/* アイコンスペース（必要に応じて） */}
        {children}
      </span>

      {/* フォーカスリング */}
      <div className="absolute inset-0 rounded-xl ring-2 ring-purple-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 opacity-0 focus:opacity-100 transition-opacity duration-200" />
    </button>
  );
};

export default Button;