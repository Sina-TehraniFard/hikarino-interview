# Stripe Webhook 本番運用設計

このドキュメントでは、Stripe決済完了後のイベントを信頼可能かつ再実行安全な形で処理するWebhookエンドポイントの設定と運用について説明します。

## 🏗️ アーキテクチャ概要

```
Stripe → Webhook Server (Express) → Firebase Functions (addCoin)
                ↓
        Firestore (冪等性チェック + コイン付与)
```

## 📁 ディレクトリ構造

```
functions-core/
├─ src/
│   ├─ index.ts                ← Firebase関数エントリ（spendCoin, addCoin）
│   └─ webhook/
│       ├─ server.ts           ← Expressサーバ（ポート3001）
│       └─ stripe.ts           ← Stripe検証・addCoin発火ロジック
├─ .env                        ← 環境変数（Git除外済み）
└─ package.json               ← 依存関係とスクリプト
```

## 🔐 セキュリティ要件

### 1. Stripe署名検証
- Webhookエンドポイントは必ずStripe署名を検証
- `STRIPE_WEBHOOK_SECRET`による厳密な検証
- 署名検証失敗時は400エラーを返却

### 2. 内部認証
- addCoin関数は`INTERNAL_WEBHOOK_KEY`による認証必須
- Webhookサーバからのみ呼び出し可能
- 外部からの直接呼び出しは401エラーで拒否

### 3. 冪等性保証
- 同一イベントIDの重複処理を防止
- Firestoreの`processed_webhook_events`コレクションで管理
- 処理済みイベントは200レスポンスで即座に返却

## 🚀 セットアップ手順

### 1. 環境変数設定

`.env`ファイルを作成し、以下の値を設定：

```bash
# Stripe Webhook Configuration
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxx
INTERNAL_WEBHOOK_KEY=your_secure_random_key_here

# Environment
NODE_ENV=production  # または development

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id_here

# Server Configuration
WEBHOOK_PORT=3001
```

### 2. 依存関係インストール

```bash
cd functions-core
npm install
```

### 3. ビルド

```bash
npm run build
```

### 4. Webhookサーバ起動

```bash
# 開発環境
npm run webhook:dev

# 本番環境
npm run webhook:start
```

### 5. Firebase Functions デプロイ

```bash
npm run deploy
```

## 🔧 Stripe設定

### 1. Webhookエンドポイント登録

Stripeダッシュボードで以下のエンドポイントを登録：

```
https://your-domain.com/webhook
```

### 2. 監視イベント

以下のイベントを監視対象に設定：

- `checkout.session.completed`
- `payment_intent.succeeded`

### 3. メタデータ設定

決済時に以下のメタデータを必須で設定：

```javascript
{
  userId: "user_firebase_uid",
  coinAmount: "100"  // 付与するコイン数
}
```

## 📊 ログとモニタリング

### ログ出力項目

- 処理成否（✅/❌）
- イベントID
- ユーザーID
- コイン数
- タイムスタンプ
- エラー詳細（失敗時）

### 監視ポイント

1. **署名検証失敗率**
   - 高い場合はStripe設定を確認

2. **冪等性チェック**
   - 重複イベントの発生頻度

3. **addCoin関数の成功率**
   - Firebase接続やFirestore書き込みエラー

4. **レスポンス時間**
   - Webhook処理の性能監視

## 🔄 運用フロー

### 正常フロー

1. ユーザーがStripe決済を完了
2. StripeがWebhookイベントを送信
3. Webhookサーバが署名検証
4. 冪等性チェック（未処理の場合のみ続行）
5. addCoin関数を内部認証付きで呼び出し
6. Firestoreでコイン付与とイベント記録
7. 200レスポンスをStripeに返却

### エラーハンドリング

- **署名検証失敗**: 400エラー、ログ出力
- **重複イベント**: 200レスポンス、処理スキップ
- **ユーザー不存在**: 404エラー、ログ出力
- **Firestore障害**: 500エラー、リトライ対象

## 🧪 テスト方法

### 1. ローカルテスト

```bash
# Webhookサーバ起動
npm run webhook:dev

# Stripe CLIでテストイベント送信
stripe listen --forward-to localhost:3001/webhook
stripe trigger checkout.session.completed
```

### 2. 本番テスト

Stripeダッシュボードの「Webhookテスト」機能を使用

## 🚨 トラブルシューティング

### よくある問題

1. **署名検証失敗**
   - `STRIPE_WEBHOOK_SECRET`の値を確認
   - body-parser.raw()の設定を確認

2. **addCoin認証失敗**
   - `INTERNAL_WEBHOOK_KEY`の値を確認
   - Authorizationヘッダの形式を確認

3. **冪等性エラー**
   - Firestoreの接続状況を確認
   - `processed_webhook_events`コレクションの権限を確認

### ログ確認

```bash
# Firebase Functions ログ
firebase functions:log

# Webhookサーバ ログ
# サーバ起動時のコンソール出力を確認
```

## 📋 チェックリスト

### デプロイ前

- [ ] `.env`ファイルの全項目設定完了
- [ ] `npm run build`でエラーなし
- [ ] Stripe Webhookエンドポイント登録
- [ ] Firebase Functions デプロイ完了
- [ ] 本番環境での署名検証テスト

### 運用開始後

- [ ] ログ監視体制の確立
- [ ] アラート設定（エラー率、レスポンス時間）
- [ ] 定期的な冪等性チェック
- [ ] バックアップとリカバリ手順の確認

## 🔒 セキュリティ注意事項

1. **環境変数の管理**
   - `.env`ファイルは絶対にコミットしない
   - 本番環境では環境変数またはシークレット管理サービスを使用

2. **ネットワークセキュリティ**
   - WebhookサーバはHTTPS必須
   - 適切なファイアウォール設定

3. **ログセキュリティ**
   - 機密情報（秘密鍵等）をログに出力しない
   - ログの適切な保存期間設定

4. **アクセス制御**
   - Firebase Functionsの適切なIAM設定
   - Firestoreセキュリティルールの設定

---

**重要**: この設計は本番稼働の可否に直結します。全ての要件を満たし、十分なテストを実施してから運用を開始してください。 