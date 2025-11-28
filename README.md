# サクラエディタ

モダンな Web ベースのコードエディタ。Next.js、TypeScript、TailwindCSS を使用して構築された高性能なエディタです。

## 機能

- 高速なパフォーマンス

  - Monaco Editor をベースにした高性能なコードエディタ
  - リアルタイムなシンタックスハイライト
  - インテリセンスとコード補完

- モダンな UI/UX

  - ドラッグ可能な設定ダイアログ
  - カスタマイズ可能なテーマ
  - レスポンシブデザイン

- 多言語対応

  - 日本語/英語のインターフェース
  - i18n による柔軟な言語切り替え

- 豊富な設定オプション

  - 一般設定
  - 表示設定
  - キーボードショートカット
  - ファイル設定

- 高度な検索機能
  - リアルタイム検索
  - 正規表現対応
  - ファイル内検索

## 技術スタック

- **フロントエンド**

  - Next.js (App Router)
  - React
  - TypeScript
  - TailwindCSS
  - shadcn/ui
  - Monaco Editor

- **状態管理**

  - Zustand
  - React Context

- **国際化**

  - i18next

- **開発ツール**
  - ESLint
  - Prettier
  - TypeScript

## 開始方法

### 必要条件

- Node.js 18.0.0 以上
- npm 9.0.0 以上

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/KoenigWolf/sakura-editor.git

# プロジェクトディレクトリに移動
cd sakura-editor

# 依存関係のインストール
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### ビルド

```bash
npm run build
```

### 本番環境での実行

```bash
npm start
```

## プロジェクト構造

```
sakura-editor/
├── app/                    # Next.js App Router
├── components/             # Reactコンポーネント
│   ├── editor/            # エディタ関連コンポーネント
│   ├── settings/          # 設定関連コンポーネント
│   └── ui/                # UIコンポーネント
├── hooks/                 # カスタムフック
├── lib/                   # ユーティリティ関数
│   ├── i18n/             # 国際化関連
│   ├── store/            # 状態管理
│   └── utils/            # ユーティリティ関数
└── public/               # 静的ファイル
```

## 設定

### 環境変数

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# 必要に応じて環境変数を追加
```

## ライセンス

MIT License

## 貢献

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 作者

- KoenigWolf - [GitHub](https://github.com/KoenigWolf)

## 謝辞

- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
