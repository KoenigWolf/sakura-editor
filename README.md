# Sakura Editor

モダンな Web ベースのコードエディタ。Next.js、TypeScript、TailwindCSS を使用して構築された高機能エディタです。

## 主な機能

### エディタ

- **Monaco Editor** をベースにした高性能コードエディタ
- リアルタイムシンタックスハイライト
- インテリセンス・コード補完
- **分割ビュー** - 縦・横分割でファイルを並べて編集
- ドラッグ可能なスプリッター

### 検索・置換

- リアルタイム検索
- 正規表現対応
- 大文字小文字の区別
- 単語単位検索
- 一括置換

### テーマ

- **12種類のカスタムテーマ**
  - ダーク: Midnight Aurora, Synthwave '84, Tokyo Night, Nord Deep, GitHub Dark, Dracula Pro
  - ライト: Sakura Blossom, Ocean Breeze, GitHub Light, Mint Fresh, Sunset Glow, Lavender Dream
- システム設定連動（ライト/ダーク/自動）
- リアルタイムプレビュー

### 設定

- **テーマ設定** - カラーテーマの選択
- **エディタ設定** - フォント、行番号、ルーラー、折り返し、空白文字表示
- **ファイル設定** - 自動保存、バックアップ、エンコーディング、改行コード
- **一般設定** - 言語切り替え（日本語/英語）
- ドラッグ・リサイズ可能な設定ダイアログ

### 多言語対応

- 日本語 / 英語 UI
- i18next による国際化

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript |
| スタイリング | TailwindCSS |
| UIコンポーネント | shadcn/ui, Radix UI |
| エディタ | Monaco Editor |
| 状態管理 | Zustand |
| 国際化 | i18next, react-i18next |
| テーマ | next-themes |

## セットアップ

### 必要条件

- Node.js 18.0.0 以上
- npm 9.0.0 以上

### インストール

```bash
git clone https://github.com/KoenigWolf/sakura-editor.git
cd sakura-editor
npm install
```

### 開発

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) で起動します。

### ビルド

```bash
npm run build
npm start
```

## プロジェクト構造

```
sakura-editor/
├── app/                    # Next.js App Router
├── components/
│   ├── editor/            # エディタ関連
│   │   ├── EditorContainer.tsx
│   │   ├── EditorToolbar.tsx
│   │   └── MonacoEditor.tsx
│   ├── search/            # 検索ダイアログ
│   ├── settings/          # 設定ダイアログ
│   │   └── tabs/         # 設定タブ
│   │       ├── ThemeSettings.tsx
│   │       ├── EditorSettings.tsx
│   │       ├── FileSettings.tsx
│   │       └── GeneralSettings.tsx
│   └── ui/                # 共通UIコンポーネント
├── lib/
│   ├── i18n/             # 国際化
│   │   └── translations/ # 翻訳ファイル
│   ├── store/            # Zustand ストア
│   ├── themes/           # カスタムテーマ定義
│   └── types/            # 型定義
├── docs/                  # ドキュメント
└── public/               # 静的ファイル
```

## AI エージェント向け

このプロジェクトは各種AIコーディングアシスタントをサポートしています。

| AI Tool | 設定ファイル |
|---------|-------------|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursorrules` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| OpenAI Codex / ChatGPT | `AGENTS.md` |

**AIエージェントへ**: コード変更前に必ず `docs/` 配下のドキュメントを確認してください。

## コントリビュート

1. フォーク
2. ブランチ作成 (`git checkout -b feature/amazing-feature`)
3. コミット (`git commit -m 'Add amazing feature'`)
4. プッシュ (`git push origin feature/amazing-feature`)
5. プルリクエスト作成

## ライセンス

MIT License

## 作者

- KoenigWolf - [GitHub](https://github.com/KoenigWolf)

## 謝辞

- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
