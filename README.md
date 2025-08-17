# Hikarino - AIタロット占いサービス

このプロジェクトは、Next.js をベースに開発された「AIタロット占いサービス」です。ユーザーが相談内容を入力し、大アルカナからランダムに3枚のカード（正逆含む）を引き、それに基づく占い結果（キャラクター語り）を表示するWebアプリケーションです。

## 🔧 技術スタック

- **Next.js 15**：フロントエンド（App Router構成）
- **React 19**：UI ライブラリ
- **TypeScript 5**：型安全性
- **Tailwind CSS 4**：スタイリング（新しいインラインテーマ構文）
- **Firebase（Auth/Firestore/Cloud Functions）**：バックエンド・データベース
- **Stripe**：決済処理（コイン制課金システム）
- **OpenAI API**：占い結果（キャラ語り）の生成

## 🚀 開発手順

### 開発サーバー起動

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くとローカル環境で動作確認ができます。

### Firebase Functions のデプロイ

```bash
firebase deploy --only functions
```

### Stripe シークレットの設定（初回のみ）

```bash
firebase functions:config:set stripe.secret="sk_test_..." stripe.webhook_secret="whsec_..."
```

### Webhook テストイベントの送信（Stripe CLI）

```bash
stripe trigger checkout.session.completed
```

## 💡 機能概要

- **ユーザー入力**：100文字以内の相談内容
- **カード抽選**：大アルカナ22枚 × 正逆位置
- **コイン制課金**：1回の占いに100コイン消費
- **キャラクター**：ヒカリノ（温かい姉のような導きを提供）
- **占い履歴**：過去の占い結果を保存・閲覧可能
- **セキュリティ**：サーバーサイドでカード引きとコイン管理

## 🏗️ プロジェクト構造

### フロントエンド構造
```
src/
├── app/                     # Next.js App Router
│   ├── page.tsx            # ホームページ（リファクタリング済み）
│   ├── history/            # 占い履歴ページ
│   └── api/                # API Routes
├── components/             # UIコンポーネント
│   ├── Header.tsx          # ヘッダー（リファクタリング済み）
│   ├── LoginModal.tsx      # ログインモーダル
│   ├── CoinPurchaseModal.tsx # コイン購入モーダル
│   └── ui/                 # 再利用可能UIコンポーネント
│       ├── Button.tsx      # 統一ボタンコンポーネント
│       ├── TarotCards.tsx  # タロットカード表示
│       ├── QuestionForm.tsx # 質問入力フォーム
│       ├── FortuneResult.tsx # 占い結果表示
│       ├── ErrorMessage.tsx # エラー表示
│       ├── HikarinoProfile.tsx # キャラクタープロフィール
│       ├── HamburgerMenu.tsx # ハンバーガーメニュー
│       └── UserInfo.tsx    # ユーザー情報表示
├── hooks/                  # カスタムフック
│   ├── useAuth.ts          # 認証フック
│   ├── useFortune.ts       # 占い機能フック（新規）
│   └── useCoinAnimation.ts # コインアニメーションフック（新規）
├── lib/                    # ユーティリティ
│   ├── firebase.ts         # Firebase設定
│   ├── tarot.ts           # タロットカード定義
│   ├── fortune.ts         # 占いビジネスロジック（新規）
│   └── firestore/         # データベース操作
├── contexts/               # React Context
│   └── CoinContext.tsx    # コイン管理（更新済み）
├── types/                  # 型定義（新規）
│   └── index.ts           # 共通型定義
└── prompts/               # AIプロンプトテンプレート
```

### 主要なリファクタリング内容

#### 1. **コンポーネント分割**
- **Before**: `page.tsx` (232行) - すべての機能が1つのファイル
- **After**: 責任ごとに分離された小さなコンポーネント

#### 2. **ビジネスロジック外部化**
- **`lib/fortune.ts`**: 占いAPI呼び出し、ストリーミング処理
- **`hooks/useFortune.ts`**: 占い機能の状態管理
- **`hooks/useCoinAnimation.ts`**: コインアニメーション専用

#### 3. **再利用可能コンポーネント**
- 統一されたButtonコンポーネント
- カード表示、フォーム入力、結果表示の分離
- ユーザー情報とメニューの分離

#### 4. **型安全性の向上**
- `src/types/index.ts`で全プロジェクト共通の型定義
- 重複していた型定義を整理統合
- TypeScript strict modeでエラー解消

## 📂 重要なファイル

### フロントエンド
- `src/app/page.tsx`: メインページ（大幅にリファクタリング）
- `src/components/Header.tsx`: ヘッダーコンポーネント（分離・整理）
- `src/hooks/useFortune.ts`: 占い機能のカスタムフック
- `src/types/index.ts`: 共通型定義

### バックエンド
- `pages/api/fortune.ts`: 占いAPI（OpenAI連携）
- `pages/api/create-checkout-session.ts`: Stripe Checkout作成
- `functions/src/index.ts`: Cloud Functions（Webhookハンドラ）

## 🔒 セキュリティ設計

- **コイン管理**: Cloud Functionsでサーバーサイド検証
- **カード抽選**: 操作防止のためサーバーサイド実行
- **決済処理**: Stripe Webhookによる安全な処理
- **認証**: Firebase Authenticationによるユーザー管理

## 🚀 開発ガイド

### コンポーネント追加時のベストプラクティス

1. **UI コンポーネント**: `src/components/ui/` に配置
2. **ビジネスロジック**: `src/lib/` または `src/hooks/` に配置
3. **型定義**: `src/types/index.ts` に追加
4. **共通スタイル**: Buttonコンポーネントのパターンを参考

### 新機能開発の流れ

1. **型定義**: まず `src/types/index.ts` で型を定義
2. **ビジネスロジック**: `src/lib/` または `src/hooks/` でロジック実装
3. **UIコンポーネント**: `src/components/ui/` で再利用可能なコンポーネント作成
4. **ページ統合**: 各ページで小さなコンポーネントを組み合わせ

### コードの品質維持

- **ESLint**: `npm run lint` でコード品質チェック
- **TypeScript**: `npm run build` で型チェック
- **ファイル分割**: 200行を超える場合は分割を検討
- **単一責任**: 1つのコンポーネント/関数は1つの責任のみ

---

## 📅 開発履歴

**2025年6月**: フロントエンドリファクタリング完了
- 232行の巨大コンポーネントを責任ごとに分離
- ビジネスロジックの外部化により保守性向上
- 再利用可能UIコンポーネントライブラリ構築
- TypeScript型安全性の大幅向上

**2025年初期**: PoCから本番リリースへ向けた開発開始
- Next.js App Router、Stripe、Cloud Functions統合
- 初期の課金導線（コイン制）に集中
- サーバー側でカード抽選処理、チート耐性確保
- キャラクター「ヒカリノ」による没入感重視
