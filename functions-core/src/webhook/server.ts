import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { handleStripeWebhook } from './stripe';

// 環境変数の読み込み
dotenv.config();

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3001;

// Stripe Webhook用のraw bodyパーサー（署名検証のため）
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

// その他のエンドポイント用のJSONパーサー
app.use(express.json());

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Stripe Webhookエンドポイント
app.post('/webhook', handleStripeWebhook);

// エラーハンドリングミドルウェア
app.use((err: Error, _req: express.Request, res: express.Response) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404ハンドラー
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Webhook server is running on port ${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app; 