import React from "react";
import { TarotCard } from "@/types";

interface MiniTarotCardProps {
  card: TarotCard;
  isReversed: boolean;
  delay?: number;
}

const MiniTarotCard: React.FC<MiniTarotCardProps> = ({ card, isReversed, delay = 0 }) => {
  const cardColors = {
    "愚者": "from-yellow-400 to-orange-500",
    "魔術師": "from-purple-500 to-pink-500",
    "女教皇": "from-blue-400 to-indigo-600",
    "女帝": "from-green-400 to-emerald-600",
    "皇帝": "from-red-500 to-orange-600",
    "教皇": "from-gray-400 to-gray-600",
    "恋人": "from-pink-400 to-rose-600",
    "戦車": "from-amber-500 to-yellow-600",
    "力": "from-orange-400 to-red-500",
    "隠者": "from-indigo-400 to-purple-600",
    "運命の輪": "from-teal-400 to-cyan-600",
    "正義": "from-blue-500 to-indigo-600",
    "吊るされた男": "from-cyan-400 to-blue-600",
    "死神": "from-gray-600 to-black",
    "節制": "from-purple-400 to-blue-500",
    "悪魔": "from-red-600 to-gray-900",
    "塔": "from-yellow-500 to-red-600",
    "星": "from-yellow-300 to-blue-500",
    "月": "from-indigo-300 to-purple-500",
    "太陽": "from-yellow-300 to-orange-400",
    "審判": "from-red-400 to-purple-600",
    "世界": "from-green-500 to-blue-600"
  };


  const gradient = cardColors[card.name as keyof typeof cardColors] || "from-gray-400 to-gray-600";

  return (
    <div
      className={`
        relative group cursor-pointer
        animate-fadeIn
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* カード本体 */}
      <div
        className={`
          w-16 h-24 md:w-20 md:h-28
          bg-gradient-to-br ${gradient}
          rounded-lg shadow-lg
          transform transition-all duration-200
          hover:scale-110 hover:shadow-xl hover:z-10
          ${isReversed ? "rotate-180" : ""}
          relative overflow-hidden
        `}
      >
        {/* カード内装飾 */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* 星の装飾 */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                top: `${20 + i * 25}%`,
                left: `${30 + i * 20}%`,
                animationDelay: `${i * 200}ms`
              }}
            >
              <div className="w-1 h-1 bg-white/60 rounded-full" />
            </div>
          ))}
        </div>

        {/* 中央のシンボル（簡略化） */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`
            w-8 h-8 md:w-10 md:h-10
            border-2 border-white/30
            rounded-full
            ${isReversed ? "rotate-180" : ""}
          `} />
        </div>
      </div>


      {/* PC版ホバーポップアップ */}
      <div className={`
        hidden md:block
        absolute z-30 
        -top-12
        left-1/2 transform -translate-x-1/2
        bg-gray-900 dark:bg-gray-800 text-white
        px-3 py-2 rounded-lg shadow-xl
        text-sm font-medium whitespace-nowrap
        opacity-0 group-hover:opacity-100
        scale-75 group-hover:scale-100
        transition-all duration-200 ease-out
        pointer-events-none
        border border-gray-700 dark:border-gray-600
      `}>
        {card.name}
        {isReversed && (
          <span className="ml-2 text-xs text-red-300">逆位置</span>
        )}
        
      </div>

      {/* モバイル版カード名表示 - カードに重ねて表示 */}
      <div className="md:hidden absolute bottom-0 left-0 right-0">
        <div className="bg-black/70 text-white px-2 py-1 text-xs font-medium text-center backdrop-blur-sm">
          {card.name}
          {isReversed && (
            <span className="ml-1 text-red-300">逆</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniTarotCard;