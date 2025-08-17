import { FortuneHistory } from "@/types";
import { differenceInDays } from "date-fns";

export interface FortuneStats {
  totalReadings: number;
  mostFrequentCard: {
    name: string;
    count: number;
    meaning: string;
  } | null;
  readingFrequency: {
    average: string;
    pattern: string;
  };
  dominantElement: {
    element: string;
    percentage: number;
    meaning: string;
  };
  specialInsight: string;
}

// タロットカードの元素属性
export const cardElements: Record<string, string> = {
  "愚者": "風",
  "魔術師": "地",
  "女教皇": "水",
  "女帝": "風",
  "皇帝": "火",
  "教皇": "地",
  "恋人": "風",
  "戦車": "水",
  "力": "火",
  "隠者": "地",
  "運命の輪": "水",
  "正義": "風",
  "吊るされた男": "水",
  "死神": "水",
  "節制": "火",
  "悪魔": "地",
  "塔": "水",
  "星": "風",
  "月": "水",
  "太陽": "火",
  "審判": "水",
  "世界": "風"
};

const elementMeanings: Record<string, string> = {
  "火": "行動的な時期かもしれません",
  "水": "感情面での変化がありそうです",
  "風": "新しいアイデアが生まれやすい時期です",
  "地": "着実に進めると良さそうです"
};

export function analyzeFortuneHistory(fortunes: FortuneHistory[]): FortuneStats {
  if (fortunes.length === 0) {
    return {
      totalReadings: 0,
      mostFrequentCard: null,
      readingFrequency: {
        average: "データなし",
        pattern: "まだデータが少ないです"
      },
      dominantElement: {
        element: "未定",
        percentage: 0,
        meaning: "まだデータが少ないです"
      },
      specialInsight: "もう少し使っていただくと、傾向が見えてきます"
    };
  }

  // カード出現頻度の計算
  const cardCounts = new Map<string, number>();
  const elementCounts = { 火: 0, 水: 0, 風: 0, 地: 0 };
  
  fortunes.forEach(fortune => {
    fortune.cards.forEach(({ cardName }) => {
      cardCounts.set(cardName, (cardCounts.get(cardName) || 0) + 1);
      const element = cardElements[cardName];
      if (element) {
        elementCounts[element as keyof typeof elementCounts]++;
      }
    });
  });

  // 最頻出カード
  let mostFrequentCard = null;
  let maxCount = 0;
  cardCounts.forEach((count, cardName) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentCard = {
        name: cardName,
        count,
        meaning: getCardMeaning(cardName)
      };
    }
  });

  // 占い頻度の分析
  const frequency = analyzeReadingFrequency(fortunes);

  // 支配的な元素
  const totalElements = Object.values(elementCounts).reduce((a, b) => a + b, 0);
  const dominantElement = Object.entries(elementCounts).reduce((a, b) => 
    elementCounts[a[0] as keyof typeof elementCounts] > elementCounts[b[0] as keyof typeof elementCounts] ? a : b
  );

  // 特別な洞察
  const specialInsight = generateSpecialInsight(fortunes, mostFrequentCard, dominantElement[0]);

  return {
    totalReadings: fortunes.length,
    mostFrequentCard,
    readingFrequency: frequency,
    dominantElement: {
      element: dominantElement[0],
      percentage: Math.round((dominantElement[1] / totalElements) * 100),
      meaning: elementMeanings[dominantElement[0]]
    },
    specialInsight
  };
}

function getCardMeaning(cardName: string): string {
  const meanings: Record<string, string> = {
    "愚者": "新しいことに挑戦する機会が多いようです",
    "魔術師": "アイデアを形にする力があるようです",
    "女教皇": "直感を信じると良いかもしれません",
    "女帝": "周りの人を大切にする時期のようです",
    "皇帝": "リーダーシップを発揮する場面が多そうです",
    "教皇": "学びや教えることに縁がありそうです",
    "恋人": "選択を迫られることが多いかもしれません",
    "戦車": "目標に向かって進む力があるようです",
    "力": "忍耐強く対処することが多いようです",
    "隠者": "一人で考える時間が必要かもしれません",
    "運命の輪": "状況が変わりやすい時期のようです",
    "正義": "公平な判断を求められることが多そうです",
    "吊るされた男": "違う角度から物事を見る必要がありそうです",
    "死神": "何かが終わり、新しく始まる時期のようです",
    "節制": "バランスを取ることが大切な時期です",
    "悪魔": "何かに縛られている感覚があるかもしれません",
    "塔": "予想外の出来事が起きやすいようです",
    "星": "希望を持ち続けることが大切な時期です",
    "月": "不安や迷いが出やすい時期かもしれません",
    "太陽": "物事がうまく進みやすい時期のようです",
    "審判": "過去を振り返る機会が多そうです",
    "世界": "一つの区切りを迎える時期のようです"
  };
  return meanings[cardName] || "興味深いカードです";
}

function analyzeReadingFrequency(fortunes: FortuneHistory[]): { average: string; pattern: string } {
  if (fortunes.length < 2) {
    return { average: "分析中", pattern: "まだデータが少ないです" };
  }

  const sortedFortunes = [...fortunes].sort((a, b) => 
    (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0)
  );

  const firstDate = new Date((sortedFortunes[0].timestamp?.seconds || 0) * 1000);
  const lastDate = new Date((sortedFortunes[sortedFortunes.length - 1].timestamp?.seconds || 0) * 1000);
  const daysDiff = differenceInDays(lastDate, firstDate) || 1;
  
  const avgDays = Math.round(daysDiff / (fortunes.length - 1));

  let pattern = "";
  if (avgDays <= 1) {
    pattern = "毎日利用されています";
  } else if (avgDays <= 3) {
    pattern = "定期的に利用されています";
  } else if (avgDays <= 7) {
    pattern = "週単位で利用されています";
  } else {
    pattern = "不定期に利用されています";
  }

  return {
    average: avgDays <= 1 ? "毎日" : `約${avgDays}日ごと`,
    pattern
  };
}


function generateSpecialInsight(
  fortunes: FortuneHistory[], 
  mostFrequentCard: { name: string; count: number } | null,
  dominantElement: string
): string {
  // カードの意味を含めた占い的な解釈
  const cardInsights: Record<string, string> = {
    "愚者": "新しいことに恐れず挑戦する時期かもしれません",
    "魔術師": "アイデアを実現させる力が高まっているようです",
    "女教皇": "内なる声に耳を傾けることが大切な時期です",
    "女帝": "創造性や愛情が豊かになる時期のようです",
    "皇帝": "リーダーシップを発揮する場面が増えそうです",
    "教皇": "伝統や学びを大切にすると良い時期です",
    "恋人": "大切な選択を迫られることが多い時期です",
    "戦車": "前進する力が強まっている時期です",
    "力": "内なる強さで困難を乗り越える時期です",
    "隠者": "内省と自己探求が必要な時期かもしれません",
    "運命の輪": "変化の波に乗る準備をする時期です",
    "正義": "バランスと公正さが求められる時期です",
    "吊るされた男": "視点を変えることで道が開ける時期です",
    "死神": "古いものを手放し、新しく生まれ変わる時期です",
    "節制": "調和とバランスを保つことが大切な時期です",
    "悪魔": "執着から解放される必要がある時期かもしれません",
    "塔": "大きな変化や気づきが訪れる時期です",
    "星": "希望を持ち続けることで道が開ける時期です",
    "月": "直感を信じながら慎重に進む時期です",
    "太陽": "成功や喜びが訪れやすい時期です",
    "審判": "過去を清算し、新たなスタートを切る時期です",
    "世界": "一つのサイクルが完成し、次の段階へ進む時期です"
  };

  const elementInsights: Record<string, string> = {
    "火": "行動力と情熱が求められる時期のようです",
    "水": "感情や直感を大切にすると良い時期です",
    "風": "コミュニケーションや新しいアイデアが重要な時期です",
    "地": "現実的で着実な歩みが大切な時期です"
  };

  if (fortunes.length > 10 && mostFrequentCard) {
    // カードと属性の両方の意味を組み合わせる
    const cardMeaning = cardInsights[mostFrequentCard.name] || "興味深い傾向が現れています";
    return `${mostFrequentCard.name}がよく出ています。${cardMeaning}`;
  } else if (fortunes.length > 10) {
    // 属性の意味を伝える
    const elementMeaning = elementInsights[dominantElement] || "特定の傾向が見られます";
    return `${dominantElement}属性のカードが多く、${elementMeaning}`;
  } else if (fortunes.length > 5) {
    return "少しずつあなたの傾向が見えてきています";
  } else {
    return "もう少し続けると、あなたの傾向が見えてきます";
  }
}