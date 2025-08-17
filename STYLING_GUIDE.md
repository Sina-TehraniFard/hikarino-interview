# Styling Guide - ヒカリノ

## 基本原則

このプロジェクトでは、**最高にエレガントでスタイリッシュ**なUIを実現するため、以下の原則に従います：

1. **Tailwind CSSのみ使用** - CSS-in-JS、styled-components、インラインスタイルは使用しない
2. **エレガンス第一** - シンプルさと洗練さを追求
3. **一貫性** - 全コンポーネントで統一されたデザイン言語を使用

## カラーパレット

### プライマリカラー
- **メイン**: `purple-600` - ブランドカラー
- **ホバー**: `purple-700` - インタラクティブ要素
- **ライト**: `purple-50` - 背景アクセント
- **ボーダー**: `purple-200` - 境界線

### ニュートラルカラー
- **テキスト**: `gray-900` (ライト) / `gray-100` (ダーク)
- **サブテキスト**: `gray-600` (ライト) / `gray-400` (ダーク)
- **背景**: `white` (ライト) / `gray-900` (ダーク)
- **カード背景**: `gray-50` (ライト) / `gray-800` (ダーク)

### アクセントカラー
- **成功**: `emerald-500`
- **警告**: `amber-500`
- **エラー**: `rose-500`
- **情報**: `blue-500`

## タイポグラフィ

### フォントサイズ
- **見出し1**: `text-4xl md:text-5xl font-bold`
- **見出し2**: `text-3xl md:text-4xl font-semibold`
- **見出し3**: `text-2xl md:text-3xl font-semibold`
- **本文**: `text-base md:text-lg`
- **小テキスト**: `text-sm`

### 行間
- **見出し**: `leading-tight`
- **本文**: `leading-relaxed`

## スペーシング

### マージン・パディング
- **極小**: `p-2` / `m-2` (8px)
- **小**: `p-4` / `m-4` (16px)
- **中**: `p-6` / `m-6` (24px)
- **大**: `p-8` / `m-8` (32px)
- **特大**: `p-12` / `m-12` (48px)

### セクション間隔
- **小セクション**: `space-y-4`
- **中セクション**: `space-y-8`
- **大セクション**: `space-y-12`

## コンポーネントパターン

### ボタン
```tsx
// プライマリボタン
className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95"

// セカンダリボタン
className="px-6 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-medium rounded-lg transition-all duration-200"

// ゴーストボタン
className="px-6 py-3 text-purple-600 hover:bg-purple-50 font-medium rounded-lg transition-all duration-200"
```

### カード
```tsx
className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6"
```

### モーダル
```tsx
// オーバーレイ
className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"

// モーダルコンテンツ
className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300"
```

### メッセージダイアログ
```tsx
// 情報（info）
アイコン: 💭
背景色: bg-blue-50 dark:bg-blue-950/20
ボーダー: border-blue-200 dark:border-blue-700
テキスト: text-blue-800 dark:text-blue-200
ボタン: bg-blue-600 hover:bg-blue-700

// 警告（warning）
アイコン: ⚠️
背景色: bg-amber-50 dark:bg-amber-950/20
ボーダー: border-amber-200 dark:border-amber-700
テキスト: text-amber-800 dark:text-amber-200
ボタン: bg-amber-600 hover:bg-amber-700

// エラー（error）
アイコン: ❌
背景色: bg-red-50 dark:bg-red-950/20
ボーダー: border-red-200 dark:border-red-700
テキスト: text-red-800 dark:text-red-200
ボタン: bg-red-600 hover:bg-red-700

// 成功（success）
アイコン: ✅
背景色: bg-emerald-50 dark:bg-emerald-950/20
ボーダー: border-emerald-200 dark:border-emerald-700
テキスト: text-emerald-800 dark:text-emerald-200
ボタン: bg-emerald-600 hover:bg-emerald-700
```

### フォーム要素
```tsx
// インプット
className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"

// テキストエリア
className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
```

## アニメーション

### トランジション
- **標準**: `transition-all duration-200`
- **スロー**: `transition-all duration-300`
- **エントランス**: `transition-all duration-500`

### ホバーエフェクト
- **リフト**: `hover:shadow-lg hover:-translate-y-1`
- **グロー**: `hover:shadow-purple-500/25`
- **スケール**: `hover:scale-105`

### エントランスアニメーション
```tsx
// フェードイン
className="animate-fadeIn"

// スライドアップ
className="animate-slideUp"

// スケールイン
className="animate-scaleIn"
```

## レスポンシブデザイン

### ブレークポイント
- **モバイル**: デフォルト (< 640px)
- **タブレット**: `md:` (768px以上)
- **デスクトップ**: `lg:` (1024px以上)
- **ワイド**: `xl:` (1280px以上)

### コンテナ
```tsx
className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8"
```

## アクセシビリティ

### フォーカス状態
```tsx
className="focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
```

### インタラクティブ要素
- 十分なタップターゲットサイズ (最小44x44px)
- 明確なホバー・フォーカス状態
- 適切なコントラスト比

## ダークモード

すべてのコンポーネントでダークモードをサポート：
```tsx
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
```

## CSS利用方針

### 基本原則
1. **Tailwind CSS優先** - 可能な限りTailwindを使用
2. **カスタムCSS制限** - 以下の場合のみ許可：
   - Tailwindで実現困難な高度なアニメーション
   - ブランド固有のエフェクト（ガラス質感、グラデーション移動など）
   - パフォーマンス最適化のため

### 許可されるカスタムCSS
- **アニメーション系**: @keyframes（但しglobals.cssで一元管理）
- **ユーティリティクラス**: .animate-* 系のカスタムクラス
- **特殊エフェクト**: backdrop-filter, transform等の組み合わせ

### 禁止事項
1. **インラインスタイル禁止** - style属性を使用しない
2. **CSS-in-JS禁止** - styled-componentsやemotionを使用しない
3. **コンポーネント固有CSS禁止** - .cssファイルをコンポーネント毎に作成しない
4. **!important禁止** - Tailwindのユーティリティクラスで解決する
5. **任意値の乱用禁止** - Tailwindのデフォルト値を優先

## ベストプラクティス

1. **コンポーネントの再利用性** - 共通のスタイルパターンはコンポーネント化
2. **セマンティックなクラス名** - cn()ヘルパーを使用して条件付きクラスを管理
3. **パフォーマンス** - 不要なアニメーションを避ける
4. **一貫性** - 同じ目的には同じユーティリティクラスを使用

## 実装例

### エレガントなボタンコンポーネント
```tsx
const Button = ({ variant = "primary", size = "md", children, ...props }) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 active:scale-95"
  
  const variants = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg",
    secondary: "border-2 border-purple-600 text-purple-600 hover:bg-purple-50",
    ghost: "text-purple-600 hover:bg-purple-50"
  }
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg"
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

このガイドラインに従うことで、ヒカリノは最高にエレガントでスタイリッシュなUIを実現します。