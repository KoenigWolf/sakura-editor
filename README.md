# Zen Editor

無料で使えるオンラインテキストエディタ。インストール不要でブラウザから即座に利用可能。Next.js、TypeScript、TailwindCSS を使用して構築された高機能エディタです。

## 主な機能

### エディタ

- **Monaco Editor** をベースにした高性能コードエディタ
- リアルタイムシンタックスハイライト
- **分割ビュー** - 縦・横分割でファイルを並べて編集
- ドラッグ可能なスプリッター
- **全角スペース表示** - 全角スペースを視覚的にハイライト
- モバイル対応 - スマートフォンでもスワイプ操作で快適に編集

### 検索・置換

- リアルタイム検索
- 正規表現対応
- 大文字小文字の区別
- 単語単位検索
- 一括置換
- Tab キーで検索→置換ボックス間を移動

### テーマ

- **12種類のカスタムテーマ**
  - ダーク: Midnight Aurora, Synthwave '84, Tokyo Night, Nord Deep, GitHub Dark, Dracula Pro
  - ライト: Cherry Blossom, Ocean Breeze, GitHub Light, Mint Fresh, Sunset Glow, Lavender Dream
- システム設定連動（ライト/ダーク/自動）
- リアルタイムプレビュー

### 設定

- **テーマ設定** - カラーテーマの選択
- **エディタ設定** - フォント、行番号、ルーラー、折り返し、空白文字表示（半角・全角）
- **ファイル設定** - 自動保存、バックアップ、エンコーディング、改行コード
- **一般設定** - 言語切り替え（日本語/英語）
- ドラッグ・リサイズ可能な設定ダイアログ

### 多言語対応

- 日本語 / 英語 UI
- i18next による国際化

### SEO・PWA

- 構造化データ（JSON-LD）対応
- Open Graph / Twitter Cards 対応
- PWA マニフェスト対応
- サイトマップ自動生成

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 13.5 (App Router) |
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
git clone https://github.com/your-username/mochi-editor.git
cd mochi-editor
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
mochi-editor/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # メインページ
│   ├── providers.tsx      # クライアントプロバイダー
│   ├── metadata.ts        # SEOメタデータ
│   └── sitemap.ts         # サイトマップ生成
├── components/
│   ├── editor/            # エディタ関連
│   │   ├── EditorContainer.tsx
│   │   ├── EditorToolbar.tsx
│   │   ├── MonacoEditor.tsx
│   │   ├── SearchDialog.tsx
│   │   └── FileTabs.tsx
│   ├── settings/          # 設定ダイアログ
│   │   ├── SettingsDialog.tsx
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
├── public/               # 静的ファイル
│   ├── manifest.json     # PWAマニフェスト
│   └── robots.txt        # クローラー設定
└── docs/                  # ドキュメント
```

## キーボードショートカット

| ショートカット | 機能 |
|---------------|------|
| Ctrl+F | 検索ダイアログを開く |
| Ctrl+H | 置換モード切り替え |
| Enter | 次の検索結果 |
| Shift+Enter | 前の検索結果 |
| Tab | 検索→置換ボックスへ移動 |
| Shift+Tab | 置換→検索ボックスへ移動 |
| Escape | ダイアログを閉じる |
| Alt+C | 大文字小文字区別 切り替え |
| Alt+W | 単語単位検索 切り替え |
| Alt+R | 正規表現 切り替え |

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

## 謝辞

- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
