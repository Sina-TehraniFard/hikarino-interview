// src/lib/tarot.ts
import type { TarotCard, DrawnCard } from "@/types";

export type { TarotCard, DrawnCard };

// 内部的なTarotCardの拡張（意味も含む）
export type TarotCardWithMeaning = TarotCard & {
    meaning: string;
    reversedMeaning: string;
};

// 大アルカナ22枚を定義
export const TAROT_CARDS: TarotCardWithMeaning[] = [
    { name: "愚者", meaning: "自由、無限の可能性", reversedMeaning: "無謀、無計画", imagePath: "/cards/0_fool.png" },
    { name: "魔術師", meaning: "創造力、意志", reversedMeaning: "欺瞞、自己中心", imagePath: "/cards/1_magician.png" },
    { name: "女教皇", meaning: "直感、知恵", reversedMeaning: "秘密、混乱", imagePath: "/cards/2_high_priestess.png" },
    { name: "女帝", meaning: "豊かさ、育成", reversedMeaning: "過保護、浪費", imagePath: "/cards/3_empress.png" },
    { name: "皇帝", meaning: "支配、安定", reversedMeaning: "独裁、頑固", imagePath: "/cards/4_emperor.png" },
    { name: "法王", meaning: "伝統、信仰", reversedMeaning: "束縛、偽善", imagePath: "/cards/5_hierophant.png" },
    { name: "恋人", meaning: "愛、選択", reversedMeaning: "葛藤、誘惑", imagePath: "/cards/6_lovers.png" },
    { name: "戦車", meaning: "勝利、意志", reversedMeaning: "暴走、挫折", imagePath: "/cards/7_chariot.png" },
    { name: "力", meaning: "勇気、内なる力", reversedMeaning: "弱さ、支配欲", imagePath: "/cards/8_strength.png" },
    { name: "隠者", meaning: "内省、探求", reversedMeaning: "孤立、迷走", imagePath: "/cards/9_hermit.png" },
    { name: "運命の輪", meaning: "転機、好機", reversedMeaning: "停滞、不運", imagePath: "/cards/10_wheel_of_fortune.png" },
    { name: "正義", meaning: "公平、バランス", reversedMeaning: "不正、偏り", imagePath: "/cards/11_justice.png" },
    { name: "吊るされた男", meaning: "忍耐、犠牲", reversedMeaning: "自己犠牲、無駄な努力", imagePath: "/cards/12_hanged_man.png" },
    { name: "死神", meaning: "終わり、新しい始まり", reversedMeaning: "停滞、惰性", imagePath: "/cards/13_death.png" },
    { name: "節制", meaning: "調和、バランス", reversedMeaning: "浪費、不安定", imagePath: "/cards/14_temperance.png" },
    { name: "悪魔", meaning: "誘惑、執着", reversedMeaning: "解放、拒絶", imagePath: "/cards/15_devil.png" },
    { name: "塔", meaning: "崩壊、啓示", reversedMeaning: "再起、警告", imagePath: "/cards/16_tower.png" },
    { name: "星", meaning: "希望、癒し", reversedMeaning: "絶望、妄想", imagePath: "/cards/17_star.png" },
    { name: "月", meaning: "不安、幻影", reversedMeaning: "直感の欠如、混乱", imagePath: "/cards/18_moon.png" },
    { name: "太陽", meaning: "成功、喜び", reversedMeaning: "失敗、過信", imagePath: "/cards/19_sun.png" },
    { name: "審判", meaning: "覚醒、復活", reversedMeaning: "後悔、拒絶", imagePath: "/cards/20_judgement.png" },
    { name: "世界", meaning: "完成、達成", reversedMeaning: "未完、不満", imagePath: "/cards/21_world.png" },
];

// ランダムに3枚引く関数
export function drawThreeCards(): DrawnCard[] {
    const shuffled = TAROT_CARDS.sort(() => 0.5 - Math.random());
    return [0, 1, 2].map((i) => ({
        card: {
            name: shuffled[i].name,
            imagePath: shuffled[i].imagePath,
        },
        isReversed: Math.random() < 0.5,
        position: i + 1,
    }));
}