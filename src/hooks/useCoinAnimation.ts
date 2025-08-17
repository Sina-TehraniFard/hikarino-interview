/**
 * コインアニメーション用カスタムフック
 * 
 * 【何をするフック？】
 * コインの数が変わったときに、「パラパラ」と数字がアニメーションで変わる効果を作るフックです。
 * 
 * 【例え話】
 * ゲームでポイントが増減するとき、いきなり「100→200」と変わるより、
 * 「100→101→102→...→200」とカウントアップする方が気持ちいいですよね。
 * このフックは、そんな「数字が動く演出」を作ります。
 * 
 * 【具体的なシーン】
 * - 占いでコインを100消費したとき：500 → 499 → 498 → ... → 400
 * - コインを購入したとき：400 → 401 → 402 → ... → 500
 * 
 * 【技術的なポイント】
 * ただの数字表示だと味気ないので、「お金を使った感」「お金をもらった感」を
 * 演出で表現することで、ユーザー体験を向上させています。
 */

import { useState, useEffect, useRef, useCallback } from "react";

export const useCoinAnimation = (coins: number, userId?: string) => {
  // ===== 状態管理 =====
  
  // 画面に表示するコイン数（アニメーション用）
  // 通常は実際のコイン数と同じ
  const [displayCoins, setDisplayCoins] = useState(coins);
  
  // ===== アニメーション制御用の参照 =====
  
  // setInterval（一定間隔で処理を繰り返す仕組み）のIDを保存
  // アニメーションを途中で止めるときに使用
  const animatingRef = useRef<NodeJS.Timeout | null>(null);
  
  // 前回のユーザーIDを記憶（ユーザー切り替え検知用）
  const prevUserId = useRef<string | undefined>(userId);

  // ===== 実際のコイン数が変わったときの処理 =====
  useEffect(() => {
    // ユーザー切り替えの場合は即座に表示を更新
    if (prevUserId.current !== userId) {
      setDisplayCoins(coins);
      prevUserId.current = userId;
      return;
    }
    
    // 通常の場合は即座に表示を更新（アニメーションなし）
    setDisplayCoins(coins);
  }, [coins, userId]);

  // ===== 手動でアニメーションを開始する関数 =====
  const startAnimation = useCallback((fromCoins: number, toCoins: number) => {
    // 現在進行中のアニメーションがあれば停止
    if (animatingRef.current) clearInterval(animatingRef.current);
    
    // 開始値を設定
    setDisplayCoins(fromCoins);
    
    if (fromCoins === toCoins) {
      return; // 変化がない場合は何もしない
    }
    
    // コイン増加のアニメーション
    if (fromCoins < toCoins) {
      const diff = toCoins - fromCoins;
      const interval = Math.max(400 / diff, 15); // 最低15ms間隔
      
      animatingRef.current = setInterval(() => {
        setDisplayCoins((prev) => {
          if (prev >= toCoins - 1) {
            clearInterval(animatingRef.current!);
            return toCoins; // 正確な最終値に設定
          }
          return prev + 1; // 1ずつ増やす
        });
      }, interval);
    }
    // コイン減少のアニメーション
    else if (fromCoins > toCoins) {
      const diff = fromCoins - toCoins;
      const interval = Math.max(100 / diff, 10); // 最低10ms間隔
      
      animatingRef.current = setInterval(() => {
        setDisplayCoins((prev) => {
          if (prev <= toCoins + 1) {
            clearInterval(animatingRef.current!);
            return toCoins; // 正確な最終値に設定
          }
          return prev - 1; // 1ずつ減らす
        });
      }, interval);
    }
  }, []);

  // ===== クリーンアップ処理 =====
  useEffect(() => {
    return () => {
      if (animatingRef.current) clearInterval(animatingRef.current);
    };
  }, []);

  // ===== 外部への提供 =====
  return {
    displayCoins,
    startAnimation
  };
};