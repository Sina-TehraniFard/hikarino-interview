import { memo } from 'react';

// 共通ページ背景コンポーネント

// 星の位置を固定化（再レンダリング時に変わらないようにする）
const STAR_POSITIONS = Array.from({ length: 15 }, () => ({
  top: Math.random() * 100,
  left: Math.random() * 100,
  duration: 2 + Math.random() * 3
}));

const PageBackground = memo(() => {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden">
      {/* ベースグラデーション - より明るく優しい色合い */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 dark:from-gray-900 dark:via-purple-950/20 dark:to-gray-900" />
      
      {/* 動的オーロラエフェクト - よりゆったりとした動き */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-40 w-[40rem] h-[40rem] bg-purple-300/15 rounded-full blur-[120px] animate-gentle-glow" />
        <div className="absolute -top-40 right-0 w-[35rem] h-[35rem] bg-pink-300/10 rounded-full blur-[100px] animate-gentle-glow animation-delay-3000" />
        <div className="absolute -bottom-40 left-1/2 w-[50rem] h-[50rem] bg-blue-300/15 rounded-full blur-[130px] animate-gentle-glow animation-delay-6000" />
      </div>

      {/* 浮遊する光の粒子 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-300/50 rounded-full animate-float" />
        <div className="absolute top-3/4 left-3/4 w-3 h-3 bg-pink-300/40 rounded-full animate-float animation-delay-2000" />
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-indigo-300/50 rounded-full animate-float animation-delay-4000" />
        <div className="absolute top-2/3 left-2/3 w-4 h-4 bg-purple-300/30 rounded-full animate-float animation-delay-3000" />
        <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-pink-300/40 rounded-full animate-float animation-delay-1000" />
      </div>

      {/* 星の瞬き */}
      <div className="absolute inset-0">
        {STAR_POSITIONS.map((star, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-white rounded-full animate-sparkle ${
              i % 3 === 0 ? 'animation-delay-1000' : 
              i % 3 === 1 ? 'animation-delay-2000' : 
              'animation-delay-3000'
            }`}
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              animationDuration: `${star.duration}s`
            }}
          />
        ))}
      </div>

      {/* 微細なグリッドオーバーレイ */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(123, 97, 255, 0.3) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(123, 97, 255, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* グローエフェクト */}
      <div className="absolute inset-0 backdrop-blur-[1px]" />
    </div>
  );
});

PageBackground.displayName = 'PageBackground';

export default PageBackground;