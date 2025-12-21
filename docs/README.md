# Zen Editor ドキュメント

## ドキュメント構成

```
docs/
├── README.md                    # このファイル（目次）
├── ai/
│   └── README.md               # AI エージェント向け統合ガイド
├── architecture/
│   └── README.md               # システム設計・状態管理
├── components/
│   ├── editor.md               # エディタコンポーネント
│   └── ui-components.md        # UIコンポーネント
├── developments/
│   └── project-structure-guide.md  # プロジェクト構造・規約
└── i18n/
    └── README.md               # 国際化ガイド
```

## クイックリンク

### 開発ガイド

| ドキュメント                                                  | 説明                                         |
| ------------------------------------------------------------- | -------------------------------------------- |
| [プロジェクト構造](./developments/project-structure-guide.md) | ディレクトリ構成、コーディング規約、開発環境 |
| [アーキテクチャ](./architecture/README.md)                    | レイヤー構成、状態管理、データフロー         |
| [国際化 (i18n)](./i18n/README.md)                             | 翻訳ファイルの管理、使用方法                 |

### コンポーネント

| ドキュメント                                       | 説明                               |
| -------------------------------------------------- | ---------------------------------- |
| [エディタ](./components/editor.md)                 | Monaco Editor 統合、設定、検索機能 |
| [UI コンポーネント](./components/ui-components.md) | ボタン、ダイアログ、フォーム要素   |

### AI エージェント向け

| ドキュメント                    | 説明                                  |
| ------------------------------- | ------------------------------------- |
| [AI 開発ガイド](./ai/README.md) | AI アシスタント向け統合ガイド（推奨） |

## AI エージェント設定ファイル

ルートディレクトリの設定ファイルは `docs/ai/README.md` へのポインタです：

| ファイル                          | 対象 AI                |
| --------------------------------- | ---------------------- |
| `CLAUDE.md`                       | Claude Code            |
| `.cursorrules`                    | Cursor                 |
| `.github/copilot-instructions.md` | GitHub Copilot         |
| `AGENTS.md`                       | OpenAI Codex / ChatGPT |

## 技術スタック

| カテゴリ       | 技術                    |
| -------------- | ----------------------- |
| フレームワーク | Next.js (App Router)    |
| 言語           | TypeScript 5.2          |
| 状態管理       | Zustand                 |
| UI ライブラリ  | shadcn/ui + Radix UI    |
| エディタ       | Monaco Editor           |
| スタイリング   | Tailwind CSS            |
| 国際化         | i18next + react-i18next |

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run lint     # コードチェック
npm start        # プロダクションサーバー
```
