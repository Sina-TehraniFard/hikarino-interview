import { useEffect, useRef, useState } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import animationData from '../../../public/animation/waiting-time.json';
import GlassBox from './GlassBox';

interface WaitingAnimationProps {
  onAnimationComplete: () => void;
}

const WaitingAnimation = ({ onAnimationComplete }: WaitingAnimationProps) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [playCount, setPlayCount] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [isDark, setIsDark] = useState(false);
  
  // ダークモード検知
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // MutationObserverでdarkクラスの変更を監視
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);
  
  // ダークモード対応の色変更処理
  const getModifiedAnimationData = () => {
    if (!isDark) return animationData;
    
    // ディープコピーして色を変更
    const modifiedData = JSON.parse(JSON.stringify(animationData));
    
    // 色の変換関数
    const invertColor = (color: number[]) => {
      return [
        1 - color[0], // R
        1 - color[1], // G  
        1 - color[2], // B
        color[3] || 1 // A
      ];
    };
    
    // 再帰的に色を検索・変更
    const processObject = (obj: Record<string, unknown>) => {
      if (typeof obj !== 'object' || obj === null) return;
      
      for (const key in obj) {
        const value = obj[key];
        if (key === 'c' && 
            typeof value === 'object' && 
            value !== null && 
            'k' in value && 
            Array.isArray((value as { k: unknown }).k) && 
            (value as { k: number[] }).k.length >= 3) {
          // 色配列を反転
          (value as { k: number[] }).k = invertColor((value as { k: number[] }).k);
        } else if (typeof value === 'object' && value !== null) {
          processObject(value as Record<string, unknown>);
        }
      }
    };
    
    processObject(modifiedData);
    return modifiedData;
  };

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  }, []);

  const handleComplete = () => {
    if (playCount < 2) {
      // 1回目と2回目は再度再生
      setPlayCount(prev => prev + 1);
      if (lottieRef.current) {
        lottieRef.current.goToAndPlay(0);
      }
    } else {
      // 3回目はフェードアウト開始
      setOpacity(0);
      // フェードアウト完了後にコールバック実行
      setTimeout(() => {
        onAnimationComplete();
      }, 1000); // 1秒でフェードアウト
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-[200px] transition-opacity duration-1000 ease-out w-full"
      style={{ opacity }}
    >
      <GlassBox className="p-6 flex items-center justify-center">
        <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
          <Lottie
            lottieRef={lottieRef}
            animationData={getModifiedAnimationData()}
            loop={false}
            autoplay={false}
            onComplete={handleComplete}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </GlassBox>
    </div>
  );
};

export default WaitingAnimation;