"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { CoinContext as CoinContextType } from "@/types";

const CoinContext = createContext<CoinContextType & { onCoinPurchase: (callback: (oldCoins: number, newCoins: number) => void) => (() => void) | undefined }>({ coins: 0, refreshCoins: async () => {}, consumeCoins: async () => {}, onCoinPurchase: () => undefined });

export const useCoinContext = () => useContext(CoinContext);

export const CoinProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [coins, setCoins] = useState(0);
    const [coinPurchaseCallback, setCoinPurchaseCallback] = useState<((oldCoins: number, newCoins: number) => void) | null>(null);

    const fetchCoins = useCallback(async (triggerAnimation = false) => {
        if (!user?.uid) {
            setCoins(0);
            return;
        }
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        const newCoins = docSnap.exists() ? (docSnap.data().coins ?? 0) : 0;
        
        if (triggerAnimation && coinPurchaseCallback) {
            coinPurchaseCallback(coins, newCoins);
        }
        
        setCoins(newCoins);
    }, [user, coins, coinPurchaseCallback]);

    // コイン消費処理（クラウドファンクション経由）
    // 必ず spendCoin 関数を使ってコインを減らします。
    // これにより不正操作を防ぎ、サーバー側で安全にコイン管理ができます。
    // 今後もコイン消費は必ずこの関数経由で行ってください。
    const consumeCoins = useCallback(async (amount: number) => {
        if (!user?.uid) return;
        
        try {
            const functions = getFunctions();
            const spendCoin = httpsCallable(functions, "spendCoin");
            const result = await spendCoin({ amount });
            // @ts-expect-error: 型安全のため本番では型定義を厳密に
            setCoins(result.data.newCoins ?? 0);
        } catch (error) {
            console.error('コイン消費エラー:', error);
            // エラー処理（例：コイン不足など）
            // 必要に応じてユーザー通知やリトライ処理を追加してください。
        }
    }, [user]);

    useEffect(() => {
        fetchCoins();
    }, [fetchCoins]);

    const registerPurchaseCallback = useCallback((callback: (oldCoins: number, newCoins: number) => void) => {
        setCoinPurchaseCallback(() => callback);
        
        // unsubscribe関数を返す
        return () => {
            setCoinPurchaseCallback(null);
        };
    }, []);

    return (
        <CoinContext.Provider value={{ coins, refreshCoins: fetchCoins, consumeCoins, onCoinPurchase: registerPurchaseCallback }}>
            {children}
        </CoinContext.Provider>
    );
}; 