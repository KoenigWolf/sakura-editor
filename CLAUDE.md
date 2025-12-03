# Zen Editor - Claude Code

**詳細なガイドは [docs/ai/README.md](docs/ai/README.md) を参照してください。**

## クイックスタート

コード変更前に必読：
- [プロジェクト構造](docs/developments/project-structure-guide.md)
- [アーキテクチャ](docs/architecture/README.md)
- [国際化](docs/i18n/README.md)

## 必須ルール

1. UI テキストは i18n を使用（ハードコード禁止）
2. 翻訳は `ja.ts` と `en.ts` 両方に追加
3. Zustand はセレクタで使用
4. 絶対インポート (`@/`) を使用
5. アロー関数を使用
6. 不要なコメント禁止

## コミット前

```bash
npm run build && npm run lint
```
