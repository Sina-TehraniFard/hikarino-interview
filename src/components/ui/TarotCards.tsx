// タロットカード表示コンポーネント

import Image from "next/image";
import { DrawnCard } from "@/types";
import { useState, useEffect } from "react";
import Button from "./Button";

interface TarotCardsProps {
  cards: DrawnCard[];
  onAllFlipped?: () => void;
}

// アニメーション関連の定数
const FLIP_ANIMATION_DURATION = 700; // フリップアニメーションの時間（ms）
const CALLBACK_DELAY_AFTER_ANIMATION = 100; // アニメーション後のコールバック遅延（ms）

// カードヘッダーコンポーネント
const CardHeader = ({ cardNumber }: { cardNumber: number }) => (
  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-2">
    <span className="text-sm font-bold">カード {cardNumber}</span>
  </div>
);

// カードコンテナコンポーネント
const CardContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl border border-purple-200/50 dark:border-purple-700/50 overflow-hidden">
    {children}
  </div>
);

const TarotCards = ({ cards, onAllFlipped }: TarotCardsProps) => {
  // const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<boolean[]>([]);
  const [showFlipGuide, setShowFlipGuide] = useState(true);

  // カード初期化：すべて裏面で開始
  useEffect(() => {
    if (cards.length > 0) {
      setFlippedCards(new Array(cards.length).fill(false));
      setShowFlipGuide(true);
    }
  }, [cards.length]);

  // スクロール位置監視
  useEffect(() => {
    const container = document.querySelector('.tarot-scroll-container') as HTMLElement;
    if (!container) return;

    const handleScroll = () => {
      // カードスクロール処理（現在は表示のみなので処理なし）
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [cards.length]);

  // カードフリップ処理
  const handleCardFlip = (index: number) => {
    setFlippedCards(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = true;
      return newFlipped;
    });
    
    // 初回フリップ後はガイド非表示
    if (showFlipGuide && flippedCards.some(flipped => flipped)) {
      setShowFlipGuide(false);
    }
  };

  // 全カード一括フリップ（表/裏の切り替え）
  const handleFlipAll = () => {
    const allFlipped = flippedCards.every(flipped => flipped);
    if (allFlipped) {
      // 全て表なら裏に戻す
      setFlippedCards(new Array(cards.length).fill(false));
      setShowFlipGuide(true);
    } else {
      // 一部または全て裏なら表にする
      setFlippedCards(new Array(cards.length).fill(true));
      setShowFlipGuide(false);
    }
  };

  // すべてフリップされたかチェック
  useEffect(() => {
    if (cards.length > 0 && flippedCards.length === cards.length) {
      const allFlipped = flippedCards.every(flipped => flipped);
      if (allFlipped && onAllFlipped) {
        // アニメーション完了を待ってからコールバック実行
        setTimeout(() => {
          onAllFlipped();
        }, FLIP_ANIMATION_DURATION + CALLBACK_DELAY_AFTER_ANIMATION);
      }
    }
  }, [flippedCards, cards.length, onAllFlipped]);

  if (cards.length === 0) return null;

  return (
    <div className="mt-6 mb-12">
      {/* フリップガイド */}
      {!flippedCards.every(flipped => flipped) && (
        <div className="mb-6 text-center transition-all duration-500 ease-in-out">
          <Button
            onClick={handleFlipAll}
            variant="secondary"
            size="medium"
          >
            <div className="flex items-center justify-center">
              <div className="relative mr-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 rounded-full animate-pulse shadow-lg"></div>
                {/* 躍動感のあるグロウエフェクト */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/60 to-pink-400/60 rounded-full blur-sm animate-ping opacity-75"></div>
              </div>
              すべてのカードを一度に表示
            </div>
          </Button>
        </div>
      )}
      
      {/* 横スクロール可能なカード表示エリア（画面全幅使用） */}
      <div className="relative w-screen -ml-6 md:-ml-0 md:w-full overflow-hidden">
        {/* スクロールコンテナ（スクロールバー非表示） */}
        <div 
          className="tarot-scroll-container flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide touch-pan-x snap-x snap-mandatory pb-4 pl-6 md:pl-0"
        >
          {/* 左端の余白 */}
          <div className="flex-shrink-0 w-4"></div>
          
          {cards.map((item, idx) => (
            <div
              key={idx}
              className="relative group flex-shrink-0 w-40 md:w-52 snap-center"
            >
              {/* カード本体（3Dフリップ対応） */}
              <div 
                className={`relative preserve-3d transition-transform duration-700 cursor-pointer ${
                  flippedCards[idx] ? 'rotate-y-180' : ''
                }`}
                onClick={() => !flippedCards[idx] && handleCardFlip(idx)}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* 裏面 */}
                <div className="absolute inset-0 backface-hidden">
                  <CardContainer>
                    <CardHeader cardNumber={idx + 1} />
                    
                    {/* 裏面画像 */}
                    <div className="relative p-4">
                      <Image
                        src="/cards/tarot-back-side.png"
                        alt="タロットカード裏面"
                        width={120}
                        height={180}
                        className="w-full aspect-[2/3] object-cover rounded-lg"
                        priority={idx === 0}
                      />
                      
                      {/* タップアイコン */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-3 shadow-lg animate-pulse">
                          <span className="text-2xl">👆</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* フッター */}
                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                        タップして表示
                      </p>
                    </div>
                  </CardContainer>
                </div>

                {/* 表面 */}
                <div className="rotate-y-180 backface-hidden">
                  <CardContainer>
                    <CardHeader cardNumber={idx + 1} />
                    
                    {/* カード画像 */}
                    <div className="relative p-4">
                      <Image
                        src={item.card.imagePath}
                        alt={item.card.name}
                        width={120}
                        height={180}
                        className={`w-full aspect-[2/3] object-cover rounded-lg transition-transform duration-300 ${
                          item.isReversed ? "rotate-180" : ""
                        }`}
                        priority={idx === 0}
                      />
                      
                      {/* 位置表示バッジ */}
                      <div className="absolute top-6 right-6">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                          item.isReversed 
                            ? "bg-rose-500 text-white" 
                            : "bg-emerald-500 text-white"
                        }`}>
                          {item.isReversed ? "逆位置" : "正位置"}
                        </div>
                      </div>
                    </div>
                    
                    {/* カード名フッター */}
                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                        {item.card.name}
                      </p>
                    </div>
                  </CardContainer>
                </div>
              </div>
            </div>
          ))}
          
          {/* 右端の余白 */}
          <div className="flex-shrink-0 w-8"></div>
        </div>
        
      </div>
    </div>
  );
};

export default TarotCards;