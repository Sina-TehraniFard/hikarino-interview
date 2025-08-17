/**
 * 占い機能のビジネスロジック
 * 
 * このファイルは、占いに関する「仕組み」や「処理の流れ」をまとめたものです。
 */

import { FortuneRequest, CardData, AuthUser } from "@/types";
import { saveFortune } from "@/lib/firestore/fortune";

/**
 * 占いAPIを呼び出す関数
 * 
 * 【何をする関数？】
 * ユーザーが入力した質問とカード情報を、AI（ChatGPT）に送って占い結果をもらう関数です。
 * 
 * @param request - 占いに必要な情報（質問文とカード情報）が入っている
 * @returns - サーバーからの返事（占い結果）を受け取るための「箱」
 */
export async function callFortuneAPI(request: FortuneRequest): Promise<Response> {
  // fetch = インターネット経由でデータを取りに行く基本的な仕組み
  // "/api/fortune" = AIが占いをしてくれるサーバーの住所のようなもの
  return fetch("/api/fortune", {
    method: "POST",                                   // POST = 「データを送ります」という意味
    headers: { "Content-Type": "application/json" }, // 「JSONという形式でデータを送ります」という宣言
    body: JSON.stringify(request),                    // request（質問とカード情報）を文字列に変換して送信
  });
}

/**
 * ストリーミングレスポンスを処理する関数
 * 
 * 【何をする関数？】
 * AIからの占い結果を「リアルタイム」で受け取って、画面に少しずつ表示する関数です。
 * 
 * 【技術的な話】
 * 通常、サーバーは「処理が全部終わってから」結果を返します。
 * でも、ストリーミングは「少しずつ」結果を送ってくれるので、
 * ユーザーは待ち時間が短く感じられます。
 * 
 * @param response - サーバーからの返事（ストリーミング形式）
 * @param onUpdate - 新しい文字が届くたびに呼ばれる関数（画面更新用）
 * @returns - 最終的に完成した占い結果の全文
 */
export async function processStreamingResponse(
  response: Response,
  onUpdate: (text: string) => void
): Promise<string> {
  // レスポンスからデータを読み取るための「読み取り機」を取得
  const reader = response.body?.getReader();
  
  // もし読み取り機が取得できなかったら、エラーを投げる
  if (!reader) {
    throw new Error("レスポンスの読み取りに失敗しました");
  }

  // TextDecoder = コンピュータの言葉（バイト）を人間の言葉（文字）に変換する道具
  const decoder = new TextDecoder();
  
  // これまでに受け取った文字を全部つなげて保存する変数
  let accumulatedText = "";

  // 無限ループ：新しいデータが来る限り処理を続ける
  while (true) {
    // サーバーから新しいデータの塊を1つ読み取る
    const { done, value } = await reader.read();
    
    // done = true なら「もう送るデータはありません」という意味なので、ループを抜ける
    if (done) break;
    
    // value（コンピュータの言葉）を人間が読める文字に変換
    const text = decoder.decode(value);
    
    // 今回受け取った文字を、これまでの文字に追加
    accumulatedText += text;
    
    // onUpdate関数を呼んで、画面に新しい文字を表示してもらう
    // 例：「今日のあなたの運勢は...」→「今日のあなたの運勢は良好...」
    onUpdate(accumulatedText);
  }

  // 最終的に完成した占い結果を返す
  return accumulatedText;
}

/**
 * 占い結果を保存する関数
 * 
 * 【何をする関数？】
 * 完成した占い結果を、ユーザーの履歴として保存する関数です。
 * 
 * @param user - 占いをしたユーザーの情報
 * @param question - ユーザーが入力した質問
 * @param cards - 引いたカードの情報
 * @param result - AIが生成した占い結果
 */
export async function saveFortuneResult(
  user: AuthUser,
  question: string,
  cards: CardData[],
  result: string
): Promise<void> {
  // saveFortune関数に占い情報をまとめて渡す
  // この関数が実際にデータベースに保存してくれる
  await saveFortune({
    uid: user.uid,        // ユーザーを識別するID（住民票の番号のようなもの）
    question,             // 質問文
    cards,                // カード情報
    result,               // 占い結果
  });
}

/**
 * APIエラーレスポンスを処理する関数
 * 
 * 【何をする関数？】
 * サーバーでエラーが起きたときに、ユーザーにわかりやすいメッセージを表示するための関数です。
 *
 * 【なぜ必要？】
 * エラーが起きたとき、何も表示されないとユーザーは困ってしまいます。
 * 「なんで動かないの？」「私が何か間違えた？」と不安になります。
 * だから、きちんと「今、システムに問題が起きています」と教えてあげる必要があります。
 * 
 * @param response - エラーが起きたときのサーバーからの返事
 * @returns - ユーザーに表示するためのわかりやすいエラーメッセージ
 */
export async function handleAPIError(response: Response): Promise<string> {
  try {
    // サーバーからのエラー情報を取得しようとする
    const data = await response.json();
    
    // サーバーが具体的なエラーメッセージを送ってくれた場合はそれを使う
    // そうでなければ、デフォルトのメッセージを使う
    return data.error || "占い中に問題が発生しました。しばらく時間をおいてから、もう一度お試しください。";
  } catch {
    // サーバーからのエラー情報を読み取ることすらできなかった場合
    // （通信が完全に失敗した場合など）
    return "インターネット接続に問題があるようです。接続を確認してから、もう一度お試しください。";
  }
}