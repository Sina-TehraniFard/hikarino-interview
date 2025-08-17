import React from 'react';
import dynamic from "next/dynamic";
import { useState, useEffect } from 'react';

const LottieAnimation = dynamic(() => import('lottie-react'), { ssr: false });

interface ModalHeaderProps {
  title: string;
  animationPath?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  variant?: 'default' | 'purchase';
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ 
  title, 
  animationPath, 
  onClose, 
  showCloseButton = true,
  variant = 'default'
}) => {
  const [animation, setAnimation] = useState<object | null>(null);

  useEffect(() => {
    if (animationPath) {
      fetch(animationPath)
        .then(res => res.json())
        .then(data => setAnimation(data))
        .catch(error => console.error('アニメーション読み込みエラー:', error));
    }
  }, [animationPath]);

  const headerClassName = variant === 'purchase' 
    ? "sticky top-0 z-50 bg-sky-200 dark:bg-sky-300 rounded-t-2xl px-6 md:px-8 py-4 border-b border-sky-300/50 backdrop-blur-sm"
    : "sticky top-0 z-50 bg-gradient-to-r from-purple-600/80 to-purple-700/80 dark:from-purple-700/80 dark:to-purple-800/80 rounded-t-2xl px-6 md:px-8 py-4 border-b border-purple-500/30 backdrop-blur-sm";

  return (
    <header className={headerClassName}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {animationPath && (
            <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg backdrop-blur-sm">
              {animation ? (
                <LottieAnimation
                  animationData={animation}
                  loop={true}
                  autoplay={true}
                  style={{ width: 24, height: 24 }}
                />
              ) : (
                <div className="w-6 h-6 bg-white/30 rounded-full animate-pulse" />
              )}
            </div>
          )}
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
        </div>
        
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
};

export default ModalHeader;