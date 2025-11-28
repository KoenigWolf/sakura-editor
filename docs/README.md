# ドキュメント

Mochi Editor の開発ドキュメントです。

## AI エージェント向け

**重要**: コード変更前に以下を必ず読んでください：

1. [プロジェクト構造](./developments/project-structure-guide.md) - **必読**
2. [アーキテクチャ](./architecture/README.md) - **必読**
3. [i18n ガイド](./i18n/README.md) - UI テキスト変更時

AI 用設定ファイル:
- `CLAUDE.md` - Claude Code
- `.cursorrules` - Cursor
- `.github/copilot-instructions.md` - GitHub Copilot
- `AGENTS.md` - OpenAI Codex / ChatGPT

---

## 目次

### 開発ガイド

- [プロジェクト構造](./developments/project-structure-guide.md) - ディレクトリ構成、コーディング規約
- [アーキテクチャ](./architecture/README.md) - システム設計、状態管理

### コンポーネント

- [UIコンポーネント](./components/ui-components.md) - ボタン、ダイアログ等のUI設計
- [エディタ](./components/editor.md) - Monaco Editor の統合

### 国際化

- [i18n ガイド](./i18n/README.md) - 翻訳ファイルの管理方法

## クイックリンク

| ドキュメント | 説明 |
|-------------|------|
| [開発環境セットアップ](./developments/project-structure-guide.md#開発環境セットアップ) | 初回セットアップ手順 |
| [コード品質ルール](./developments/project-structure-guide.md#コード品質ルール) | コーディング規約 |
| [Git運用](./developments/project-structure-guide.md#git運用) | ブランチ戦略、コミットルール |
