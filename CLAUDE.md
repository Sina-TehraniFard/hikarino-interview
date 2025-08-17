# Claude Code Guidelines

## 基本原則
- **Clean Code**: 自己説明的なコードを書く
- **DRY/SOLID**: 設計原則に従う

## 出力パス設定
### セッションベース管理（必須）
- **ドキュメント出力**: `/Users/$(whoami)/Documents/claude-outputs/$(date +%Y-%m-%d)/`
- **ファイル命名**: `{{内容説明}}-{レポート|ガイド|実装}.md`
- **適用対象**: ドキュメント・レポート・設計書（.md/.txt/.json）
- **除外**: ソースコード・設定ファイル・明示的パス指定時