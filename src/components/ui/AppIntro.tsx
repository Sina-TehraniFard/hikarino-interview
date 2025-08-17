// ステップガイドコンポーネント - エレガントで洗練されたデザイン

import Image from "next/image";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import GlassBox from './GlassBox';

const LottieAnimation = dynamic(() => import('lottie-react'), { ssr: false });

interface AppIntroProps {
  onStepClick?: (stepNumber: number) => void;
}

const AppIntro = ({ onStepClick }: AppIntroProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animations, setAnimations] = useState<object[]>([]);
  const [tryMeAnimation, setTryMeAnimation] = useState<object | null>(null);

  // try-meアニメーションを即座にロード
  useEffect(() => {
    fetch('/animation/try-me.json')
      .then(res => res.json())
      .then(data => setTryMeAnimation(data))
      .catch(error => console.error('try-meアニメーション読み込みエラー:', error));
  }, []);

  // Lottieアニメーションを動的にロード
  const loadAnimations = async () => {
    if (animations.length === 0) {
      try {
        const responses = await Promise.all([
          fetch('/animation/thinking-woman.json'),
          fetch('/animation/tarot-cards.json'),
          fetch('/animation/star.json'),
          fetch('/animation/crystal-ball.json')
        ]);
        const animationData = await Promise.all(responses.map(res => res.json()));
        setAnimations(animationData);
      } catch (error) {
        console.error('アニメーション読み込みエラー:', error);
      }
    }
  };

  return (
    <div className="mb-8 w-full max-w-md relative">
      {/* 洗練されたステップガイド */}
        <div className="mb-5">
          <GlassBox
            onClick={() => {
              setIsExpanded(!isExpanded);
              if (!isExpanded) loadAnimations();
            }}
          >
            <div className="relative text-gray-800 dark:text-gray-100 pl-20 pr-4 py-4 flex items-center justify-between">
              {/* ヒカリノのアイコン（ガラス効果で統合） */}
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-purple-500/20 to-transparent backdrop-blur-sm rounded-l-2xl">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-400/30 bg-white/30 backdrop-blur-sm shadow-lg">
                      <Image
                        src="/hikarino-normal.png"
                        alt="ヒカリノ"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover object-top"
                        style={{ objectPosition: "center 10%" }}
                        priority
                      />
                    </div>
                    {/* エレガントなアクセント */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                      <span className="text-white text-[8px]">✨</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center">
                <span className="text-sm font-semibold tracking-wide">ヒカリノが教える</span>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">はじめての簡単４ステップ</div>
              </div>

              <div className="w-8 h-8 flex items-center justify-center">
                {tryMeAnimation ? (
                  <LottieAnimation
                    animationData={tryMeAnimation}
                    loop={true}
                    autoplay={true}
                    style={{ width: 32, height: 32 }}
                  />
                ) : (
                  <div className="w-6 h-6 bg-purple-400 rounded-full animate-pulse" />
                )}
              </div>
            </div>
          </GlassBox>
        </div>

        {/* ステップ（エレガントなドロップダウンアニメーション） */}
        <div className={`overflow-hidden transition-all duration-700 ease-out ${
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="relative space-y-5 pt-4 bg-white/15 dark:bg-gray-900/15 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 dark:border-white/5 shadow-2xl ring-1 ring-white/10 overflow-hidden">
            {/* ガラス質感を強調する光の反射エフェクト */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -left-full top-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-glass-shine" />
            </div>
            {[
              { number: 1, title: "心の声を聞かせて✨", desc: "100文字以内で今のあなたの想いを綴ってください" },
              { number: 2, title: "神秘のカードを選ぼう🔮", desc: "3枚のタロットカードがあなたを待っています" },
              { number: 3, title: "運命の扉を開いて💫", desc: "カードをそっとタップして未来を覗いてみましょう" },
              { number: 4, title: "ヒカリノからのメッセージ🌟", desc: "あなただけの特別なメッセージをお届けします" }
            ].map((step, index) => (
              <div 
                key={step.number} 
                className={`flex items-start gap-4 group ${step.number === 1 ? 'cursor-pointer' : ''}`}
                onClick={step.number === 1 ? () => onStepClick?.(1) : undefined}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200 border border-white/20">
                    {animations[index] ? (
                      <LottieAnimation
                        animationData={animations[index]}
                        loop={true}
                        autoplay={true}
                        style={{ width: 32, height: 32 }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {step.number}
                      </div>
                    )}
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{step.title}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default AppIntro;