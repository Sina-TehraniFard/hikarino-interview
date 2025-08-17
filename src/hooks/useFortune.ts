/**
 * 占い機能のカスタムフック
 * 
 * 【カスタムフックって何？】
 * ReactというWebアプリ作成ツールの「便利機能をまとめたもの」です。
 * 
 * 【例え話】
 * 料理をするとき、「野菜炒め用セット」として
 * - 野菜を切る
 * - 油を熱する
 * - 炒める
 * という手順をまとめて用意しておくと便利ですよね。
 * 
 * このファイルも同じで、占い機能に必要な
 * - 質問を管理する
 * - カードを引く
 * - 占い結果を取得する
 * - エラーを処理する
 * という機能をまとめて「占い機能セット」として提供しています。
 */

import { useState, useCallback, useRef } from "react";
import { DrawnCard, CardData, AuthUser } from "@/types";
import { drawThreeCards } from "@/lib/tarot";
import { useCoinContext } from "@/contexts/CoinContext";
import { 
  callFortuneAPI, 
  processStreamingResponse, 
  saveFortuneResult, 
  handleAPIError 
} from "@/lib/fortune";

export const useFortune = () => {
  // ===== 状態管理 =====
  // 状態（state）= アプリの「今の状況」を記録しておく場所
  
  // ユーザーが入力した質問文を保存
  const [question, setQuestion] = useState("");
  
  // 引いたカードの情報を保存（最初は空の配列）
  const [cards, setCards] = useState<DrawnCard[]>([]);
  
  // AIからの占い結果を保存
  const [result, setResult] = useState("");
  
  // 今、占い処理中かどうかを記録（ローディング表示用）
  const [isLoading, setIsLoading] = useState(false);
  
  // 占いが完了したかどうかを記録
  const [hasFortuned, setHasFortuned] = useState(false);
  
  // エラーが起きた場合のメッセージを保存
  const [error, setError] = useState<string | null>(null);
  
  // アニメーション表示状態を管理
  const [showWaitingAnimation, setShowWaitingAnimation] = useState(false);
  
  // バックグラウンドで蓄積されているテキストを管理
  const [backgroundResult, setBackgroundResult] = useState("");
  
  // ===== ゲストユーザー対応 =====
  // ログインしていないユーザーが入力した内容を一時的に覚えておく場所
  // useRef = コンポーネントが更新されても値が消えない特別な保存場所
  
  // ゲストが入力した質問を一時保存
  const questionRef = useRef<string>("");
  
  // ゲストが引いたカードを一時保存
  const cardsRef = useRef<DrawnCard[]>([]);
  
  // コイン機能（他のファイルで定義された機能を使用）
  const { consumeCoins, coins } = useCoinContext();

  /**
   * カードを引く処理
   * 
   * 【何をする関数？】
   * タロットカードを3枚ランダムで引く処理です。
   * 
   * 【例え話】
   * トランプの山札から3枚引くのと同じです。
   * ただし、各カードが「正位置」か「逆位置」かもランダムで決まります。
   * 
   * 【useCallbackって何？】
   * 関数を「記憶」しておく仕組みです。
   * 毎回新しく作るのではなく、一度作った関数を使い回すことで、
   * アプリの動作が速くなります。
   */
  const handleDrawCards = useCallback(() => {
    // 前回の占い結果をクリア（新しく占うため）
    setResult("");
    
    // drawThreeCards() = tarot.tsで定義された「3枚引く」関数
    setCards(drawThreeCards());
  }, []); // [] = この関数は他の値に依存しないという意味

  /**
   * 占いを実行する処理
   * 
   * 【何をする関数？】
   * ユーザーの質問とカード情報をAIに送って、占い結果を受け取る一連の処理です。
   * 
   * 【処理の流れ】
   * 1. ログインチェック（ログインしていなければログイン画面を表示）
   * 2. コインチェック（足りなければ購入画面を表示）
   * 3. コインを消費
   * 4. AIに占いを依頼
   * 5. 結果を受け取って画面に表示
   * 6. 結果を履歴として保存
   * 
   * 【例え話】
   * コンビニで買い物をするときの流れと似ています：
   * 1. 商品を選ぶ（質問とカード）
   * 2. お金が足りるかチェック（コイン）
   * 3. お金を払う（コイン消費）
   * 4. 商品をもらう（占い結果）
   * 5. レシートをもらう（履歴保存）
   */
  const handleFortune = useCallback(async (
    user: AuthUser | null,           // ログインしているユーザー情報
    onRequireLogin: () => void,      // ログインが必要な時に呼ぶ関数
    onRequireCoins: () => void       // コインが必要な時に呼ぶ関数
  ) => {
    // 既に処理中の場合は何もしない（重複実行防止）
    if (isLoading) return;
    
    // ローディング状態開始
    setIsLoading(true);
    setShowWaitingAnimation(true);
    // 前回の結果とエラーをクリア
    setResult("");
    setError(null);

    // ===== ログインチェック =====
    if (!user) {
      // ログインしていない場合：
      // 1. 入力内容を一時保存（ログイン後に復元するため）
      questionRef.current = question;
      cardsRef.current = cards;
      
      // 2. ログイン画面を表示
      onRequireLogin();
      
      // 3. 処理を中断
      setIsLoading(false);
      setShowWaitingAnimation(false);
      return;
    }

    // ===== コインチェック =====
    if (coins < 100) {
      // コインが足りない場合：
      // 1. コイン購入画面を表示
      onRequireCoins();
      
      // 2. 処理を中断
      setIsLoading(false);
      setShowWaitingAnimation(false);
      return;
    }

    try {
      // ===== コイン消費 =====
      // 占い料金として100コインを消費
      await consumeCoins(100);

      // ===== カードデータの準備 =====
      // 画面表示用のカード情報から、API送信用のデータに変換
      const cardData: CardData[] = cards.map((c) => ({
        cardName: c.card.name,          // カードの名前
        isReversed: c.isReversed,       // 正位置か逆位置か
        position: c.position,           // カードの位置（1枚目、2枚目、3枚目）
      }));

      // ===== AI API呼び出し =====
      // callFortuneAPI = fortune.tsで定義された関数
      const response = await callFortuneAPI({ question, cards: cardData });

      // エラーチェック
      if (!response.ok) {
        // サーバーからエラーが返ってきた場合
        const errorMessage = await handleAPIError(response);
        setError(errorMessage);
        setIsLoading(false);
        setShowWaitingAnimation(false);
        return;
      }

      // ===== バックグラウンドでストリーミング開始 =====
      // アニメーション表示中はバックグラウンドで結果を蓄積
      const finalResult = await processStreamingResponse(response, (text) => {
        setBackgroundResult(text);
        // アニメーション非表示時は即座に結果を表示
        if (!showWaitingAnimation) {
          setResult(text);
        }
      });

      // ===== 結果の保存 =====
      // 占い結果をデータベースに保存（履歴として）
      await saveFortuneResult(user, question, cardData, finalResult);

      // 全ての処理が完了
      setIsLoading(false);
      setHasFortuned(true);
      
    } catch {
      // 予期しないエラーが発生した場合
      // （例：ネットワークエラー、サーバーダウンなど）
      setError("決済処理中に問題が発生しました。コインが消費されていないか確認の上、もう一度お試しください。");
      setIsLoading(false);
      setShowWaitingAnimation(false);
    }
  }, [isLoading, question, cards, coins, consumeCoins, showWaitingAnimation]);
  // ↑ これらの値が変わったときだけ、この関数を新しく作り直す

  /**
   * ゲストユーザーのデータを復元する関数
   * 
   * 【何をする関数？】
   * ログインしていない状態で入力した内容を、ログイン後に復元する関数です。
   * 
   * 【例え話】
   * ネットショッピングで商品をカートに入れた後、
   * ログインしても商品がカートに残っているのと同じです。
   * ユーザーの手間を省いて、スムーズに続きができるようにしています。
   */
  const restoreGuestData = useCallback((user: AuthUser | null) => {
    // ログインしたユーザーがいて、かつ一時保存されたデータがある場合
    if (user && questionRef.current) {
      // 一時保存されていた質問文を復元
      setQuestion(questionRef.current);
    }
    if (user && cardsRef.current.length > 0) {
      // 一時保存されていたカード情報を復元
      setCards(cardsRef.current);
    }
  }, []);

  /**
   * 占い状態をリセットする関数
   * 
   * 【何をする関数？】
   * 新しく占いをやり直すために、全ての状態を初期値に戻す関数です。
   * 
   * 【例え話】
   * ゲームの「最初から始める」ボタンを押したときのように、
   * 全てをリセットして新しくスタートできるようにします。
   */
  const resetFortune = useCallback(() => {
    // 通常の状態をリセット
    setQuestion("");              // 質問文をクリア
    setCards([]);                 // カード情報をクリア
    setResult("");                // 占い結果をクリア
    setError(null);               // エラーメッセージをクリア
    setHasFortuned(false);        // 占い完了フラグをリセット
    setShowWaitingAnimation(false); // アニメーション状態をリセット
    setBackgroundResult("");       // バックグラウンド結果をリセット
    
    // 一時保存データもクリア
    questionRef.current = "";
    cardsRef.current = [];
  }, []);

  // ===== 外部に提供する機能 =====
  // この関数を使う側（Reactコンポーネント）に渡す値と関数
  return {
    // 現在の状態（読み取り専用）
    question,        // 現在の質問文
    cards,           // 現在のカード情報
    result,          // 現在の占い結果
    isLoading,       // 処理中かどうか
    hasFortuned,     // 占いが完了したかどうか
    error,           // エラーメッセージ
    showWaitingAnimation, // アニメーション表示状態
    
    // 状態を変更する関数（アクション）
    setQuestion,     // 質問文を変更する関数
    handleDrawCards, // カードを引く関数
    handleFortune,   // 占いを実行する関数
    restoreGuestData,// ゲストデータを復元する関数
    resetFortune,    // 全てをリセットする関数
    setShowWaitingAnimation, // アニメーション状態を制御する関数
    
    // アニメーション完了時のコールバック
    onAnimationComplete: useCallback(() => {
      setShowWaitingAnimation(false);
      if (backgroundResult) {
        setResult(backgroundResult);
      }
    }, [backgroundResult]),
  };
};