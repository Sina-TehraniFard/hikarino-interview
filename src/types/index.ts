/**
 * 共通の型定義
 * 
 * 【型定義って何？】
 * TypeScriptで「このデータはどんな形をしているか」を決めるルールブックです。
 * 
 * 【例え話】
 * 履歴書のフォーマットと同じです。
 * 「名前」「年齢」「住所」など、どこに何を書くかが決まっていますよね。
 * プログラムでも「ユーザー情報なら名前とメールアドレスが必要」というように、
 * データの「形」を事前に決めておくことで、間違いを防げます。
 * 
 * 【なぜ必要？】
 * - バグの予防：間違ったデータ形式を使おうとするとエラーで教えてくれる
 * - 開発効率：どんなデータが来るかわかるので、コードが書きやすい
 * - チーム開発：みんなが同じ「形」でデータを扱えるので、混乱しない
 */

import { User as FirebaseUser } from "firebase/auth";

// ===== ユーザー関連の型 =====

/**
 * ユーザー情報の型
 * 
 * 【どこで使う？】
 * ログインしているユーザーの基本情報を扱うときに使います。
 * 
 * 【例】
 * const user: User = {
 *   uid: "abc123",
 *   displayName: "田中花子",
 *   email: "hanako@example.com"
 * };
 */
export interface User {
  uid?: string;                    // ユーザーの識別番号（ログインしていない場合はundefined）
  displayName?: string | null;     // 表示名（設定していない場合はnull）
  email?: string | null;           // メールアドレス（設定していない場合はnull）
  firestoreName?: string;          // Firestoreに保存されたユーザー名
}

/**
 * Firebase認証のユーザー型
 * 
 * 【何これ？】
 * Firebaseというサービスが提供するユーザー情報の型です。
 * より詳細な情報（最終ログイン時刻など）が含まれています。
 */
export type AuthUser = FirebaseUser;

// ===== カード関連の型 =====

/**
 * タロットカードの基本情報
 * 
 * 【どこで使う？】
 * タロットカードの名前と画像を表示するときに使います。
 * 
 * 【例】
 * const card: TarotCard = {
 *   name: "愚者",
 *   imagePath: "/cards/0_fool.png"
 * };
 */
export interface TarotCard {
  name: string;         // カードの名前（例：「愚者」「魔術師」）
  imagePath: string;    // カードの画像ファイルのパス
}

/**
 * 引いたカードの情報
 * 
 * 【どこで使う？】
 * ユーザーが実際に引いたカードの情報を管理するときに使います。
 * カードの基本情報に加えて、正位置か逆位置か、何番目に引いたかも記録します。
 * 
 * 【例】
 * const drawnCard: DrawnCard = {
 *   card: { name: "愚者", imagePath: "/cards/0_fool.png" },
 *   isReversed: false,  // 正位置
 *   position: 1         // 1枚目
 * };
 */
export interface DrawnCard {
  card: TarotCard;      // カードの基本情報
  isReversed: boolean;  // true = 逆位置、false = 正位置
  position: number;     // カードの位置（1枚目、2枚目、3枚目）
}

/**
 * API送信用のカードデータ
 * 
 * 【どこで使う？】
 * AIに占いを依頼するときに送信するカード情報です。
 * DrawnCardから必要な部分だけを抜き出した軽量版です。
 * 
 * 【なぜ分ける？】
 * 画像ファイルのパスなど、AIには不要な情報を省くことで、
 * 通信量を減らし、処理を速くできます。
 */
export interface CardData {
  cardName: string;     // カードの名前
  isReversed: boolean;  // 正位置か逆位置か
  position: number;     // カードの位置
}

// ===== 占い結果関連の型 =====

/**
 * 占い結果の基本情報
 * 
 * 【どこで使う？】
 * 占い結果をデータベースに保存するときに使います。
 * 
 * 【含まれる情報】
 * - 誰が占ったか（uid）
 * - 何を聞いたか（question）
 * - どのカードを引いたか（cards）
 * - AIが何と答えたか（result）
 * - いつ占ったか（createdAt）
 */
export interface Fortune {
  uid: string;          // 占いをしたユーザーのID
  question: string;     // ユーザーが入力した質問
  cards: CardData[];    // 引いたカードの情報（3枚分）
  result: string;       // AIが生成した占い結果
  createdAt?: Date;     // 占いをした日時
}

/**
 * 占い履歴表示用の型
 * 
 * 【どこで使う？】
 * 「あなたの記録」ページで過去の占い結果を表示するときに使います。
 * 
 * 【Fortuneとの違い】
 * - id: データベースでの識別番号が追加
 * - timestamp: Firestore特有の時刻形式にも対応
 */
export interface FortuneHistory extends Fortune {
  id: string;                           // データベース上の識別番号
  createdAt?: Date;                     // 標準的な日時形式
  timestamp?: {                         // Firestore形式の日時
    seconds: number;                    // 秒数
    nanoseconds: number;                // ナノ秒（より精密な時刻）
  };
}

// ===== API関連の型 =====

/**
 * 占いAPIへのリクエスト
 * 
 * 【どこで使う？】
 * フロントエンドからバックエンドに占いを依頼するときのデータ形式です。
 */
export interface FortuneRequest {
  question: string;     // ユーザーの質問
  cards: CardData[];    // 引いたカードの情報
}

/**
 * 占いAPIからのレスポンス
 * 
 * 【どこで使う？】
 * バックエンドからフロントエンドに占い結果を返すときのデータ形式です。
 */
export interface FortuneResponse {
  result: string;       // 占い結果
  error?: string;       // エラーが発生した場合のメッセージ
}

// ===== UI状態関連の型 =====

/**
 * ローディング状態の管理
 * 
 * 【どこで使う？】
 * 「今、処理中です」「エラーが発生しました」といった状態を管理するときに使います。
 * 
 * 【例】
 * const loadingState: LoadingState = {
 *   isLoading: true,
 *   error: null
 * };
 */
export interface LoadingState {
  isLoading: boolean;    // 現在処理中かどうか
  error: string | null;  // エラーメッセージ（エラーがない場合はnull）
}

// ===== コイン関連の型 =====

/**
 * コイン機能のContext型
 * 
 * 【Contextって何？】
 * React Contextは、「アプリ全体で共有する情報」を管理する仕組みです。
 * コイン残高のように、どのページでも必要な情報を効率的に管理できます。
 * 
 * 【含まれる機能】
 * - coins: 現在のコイン残高を取得
 * - consumeCoins: コインを消費する
 * - refreshCoins: 最新のコイン残高を取得し直す
 */
export interface CoinContext {
  coins: number;                                   // 現在のコイン残高
  consumeCoins: (amount: number) => Promise<void>; // コインを消費する関数
  refreshCoins: (b: boolean) => Promise<void>;               // コイン残高を更新する関数
}

// ===== イベントハンドラーの型 =====
// 【イベントハンドラーって何？】
// ユーザーがボタンを押したり、フォームに入力したりしたときに
// 実行される関数のことです。これらの型は、そういった関数の
// 「形」を定義しています。

/**
 * 引数なし、戻り値ありの関数
 * 例：() => string
 */
export type EventHandler<T = void> = () => T;

/**
 * 引数なし、戻り値ありの非同期関数
 * 例：() => Promise<string>
 */
export type AsyncEventHandler<T = void> = () => Promise<T>;

/**
 * 引数あり、戻り値ありの関数
 * 例：(userId: string) => void
 */
export type ParameterizedEventHandler<P, T = void> = (param: P) => T;

/**
 * 引数あり、戻り値ありの非同期関数
 * 例：(userId: string) => Promise<void>
 */
export type AsyncParameterizedEventHandler<P, T = void> = (param: P) => Promise<T>;