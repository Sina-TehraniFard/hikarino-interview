import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";
import * as functions from "firebase-functions/v2";
import {defineSecret} from "firebase-functions/params";
import * as admin from "firebase-admin";
import {FieldValue} from "firebase-admin/firestore";
import cors from 'cors';

admin.initializeApp();

defineSecret("STRIPE_SECRET_KEY");
defineSecret("STRIPE_WEBHOOK_SECRET");
defineSecret("INTERNAL_WEBHOOK_KEY");

// CORSミドルウェアの設定
const corsHandler = cors({
    origin: true, // すべてのオリジンを許可
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-INTERNAL-KEY'],
    credentials: true
});

/**
 * spendCoin（コインを使う関数）
 *
 * この関数は、ユーザーがコインを「まとめて」使いたいときに呼び出します。
 * たとえば100枚使いたい場合は、amount: 100 を渡します。
 * サーバー側でコインの数を確認し、まとめて減らします。
 *
 * もしログインしていない場合や、コインが足りない場合はエラーになります。
 *
 * 使い方（フロントエンド例）:
 * const spendCoin = httpsCallable(functions, 'spendCoin');
 * const result = await spendCoin({ amount: 100 });
 * console.log(result.data.newCoins); // 新しいコインの数
 *
 * セキュリティ:
 * - 必ずログインしている必要があります
 * - コインの数はサーバー側で管理されるので、不正な操作はできません
 */
export const spendCoin = onCall(async (request: CallableRequest) => {
    const uid = request.auth?.uid;
    if (!uid) {
        throw new HttpsError("unauthenticated", "ログインが必要です");
    }

    // 使いたいコインの枚数（デフォルト1）
    const amount = typeof request.data?.amount === "number" && request.data.amount > 0 ? request.data.amount : 1;

    const userRef = admin.firestore().collection("users").doc(uid);
    const userDoc = await userRef.get();
    const currentCoins = userDoc.data()?.coins || 0;

    if (currentCoins < amount) {
        throw new HttpsError("failed-precondition", "コインが足りません");
    }

    await userRef.update({coins: currentCoins - amount});
    return {newCoins: currentCoins - amount};
});

/* ------------------------------------------------------------------
 * addCoin Function - Webhook専用コイン付与関数
 * ------------------------------------------------------------------ */

export const addCoin = functions.https.onRequest(async (req, res) => {
    // CORSの処理
    return corsHandler(req, res, async () => {
        // 内部キーの検証
        const internalKey = req.headers['x-internal-key'];
        if (internalKey !== process.env.INTERNAL_WEBHOOK_KEY) {
            console.error('不正な内部キーによるアクセス試行');
            res.status(401).json({error: '認証に失敗しました'});
            return;
        }

        // Webhookのリクエストボディをログ出力
        console.log('Webhook request body:', JSON.stringify(req.body, null, 2));

        // 必要な値だけ抽出（spendCoin風）
        const uid = req.body.data?.object?.metadata?.uid;
        const coinAmount = Number(req.body.data?.object?.metadata?.coinAmount || 0);

        if (!uid || !coinAmount) {
            console.error('不正なリクエストデータ:', req.body);
            res.status(400).json({error: '必要なパラメータが不足しています'});
            return;
        }

        // コイン付与予定のログ出力
        console.log(`ユーザーID：${uid} に${coinAmount}枚のコインを付与予定ver2`);
        console.log('uid:', uid);
        console.log('metadata.coinAmount:', req.body.data?.object?.metadata?.coinAmount);
        console.log('parsed coinAmount:', coinAmount, 'type:', typeof coinAmount);

        // コインをアトミックに加算
        const userRef = admin.firestore().collection("users").doc(uid);
        await userRef.set({coins: FieldValue.increment(coinAmount)}, {merge: true});
        console.log(`ユーザーID：${uid} に${coinAmount}枚のコインを付与（FieldValue.increment 使用）`);

        res.status(200).json({
            success: true,
            message: 'コイン付与処理が完了しました',
            timestamp: new Date().toISOString()
        });
    });
});