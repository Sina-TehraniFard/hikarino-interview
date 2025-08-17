import { Request, Response } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

// Stripe初期化
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
});

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
const INTERNAL_WEBHOOK_KEY = process.env.INTERNAL_WEBHOOK_KEY!;

/**
 * Stripe Webhookハンドラー
 * payment_intent.succeeded イベントを処理し、addCoin関数を呼び出す
 */
export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature'] as string;
  const rawBody = req.body; // Bufferとして受け取る

  // ログ用の基本情報
  const logContext = {
    timestamp: new Date().toISOString(),
    signature: sig ? 'present' : 'missing',
    bodySize: rawBody ? rawBody.length : 0
  };

  console.log('🔔 Webhook received:', logContext);

  // 署名検証
  if (!sig) {
    console.error('❌ Missing Stripe signature', logContext);
    res.status(400).json({
      error: 'Missing Stripe signature',
      timestamp: logContext.timestamp
    });
    return;
  }

  let event: Stripe.Event;

  try {
    // Stripe署名検証（rawBodyをそのまま使用）
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
    console.log('✅ Stripe signature verified successfully', {
      ...logContext,
      eventType: event.type,
      eventId: event.id
    });
  } catch (err: any) {
    console.error('❌ Stripe signature verification failed:', {
      ...logContext,
      error: err.message
    });
    res.status(400).json({
      error: `Webhook signature verification failed: ${err.message}`,
      timestamp: logContext.timestamp
    });
    return;
  }

  // payment_intent.succeeded イベントのみを処理
  if (event.type !== 'payment_intent.succeeded') {
    console.log('ℹ️ Ignoring non-payment_intent.succeeded event:', {
      eventType: event.type,
      eventId: event.id,
      timestamp: logContext.timestamp
    });
    res.status(200).json({
      received: true,
      eventId: event.id,
      eventType: event.type,
      timestamp: logContext.timestamp
    });
    return;
  }

  try {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { uid, coinAmount } = paymentIntent.metadata;

    // メタデータの検証
    if (!uid || !coinAmount) {
      console.error('❌ Missing required metadata:', {
        eventId: event.id,
        metadata: paymentIntent.metadata,
        timestamp: logContext.timestamp
      });
      res.status(400).json({
        error: 'Missing required metadata (uid or coinAmount)',
        eventId: event.id,
        timestamp: logContext.timestamp
      });
      return;
    }

    console.log('💰 Payment intent succeeded - calling addCoin:', {
      eventId: event.id,
      uid,
      coinAmount,
      paymentIntentId: paymentIntent.id,
      timestamp: logContext.timestamp
    });

    // addCoin関数を呼び出す
    try {
      const firebaseFunctionUrl = "https://us-central1-hikarino-d17a6.cloudfunctions.net/addCoin";

      const response = await fetch(firebaseFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-INTERNAL-KEY': INTERNAL_WEBHOOK_KEY
        },
        body: JSON.stringify({
          uid,
          coinAmount
        })
      });

      if (!response.ok) {
        throw new Error(`addCoin function call failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ addCoin function called successfully:', result);
    } catch (error) {
      console.error('❌ Error calling addCoin function:', error);
      // エラーが発生してもWebhookは成功レスポンスを返す
      // （Stripeは再送信するため）
    }

    // 成功レスポンス
    res.status(200).json({ 
      received: true,
      eventId: event.id,
      eventType: event.type,
      timestamp: logContext.timestamp
    });

  } catch (error) {
    console.error('❌ Error processing webhook event:', {
      eventId: event.id,
      eventType: event.type,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: logContext.timestamp
    });

    res.status(500).json({ 
      error: 'Internal server error during event processing',
      eventId: event.id,
      eventType: event.type,
      timestamp: logContext.timestamp
    });
  }
}