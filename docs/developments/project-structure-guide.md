# プロジェクト構造ガイド（sakura-editor）

このガイドは、sakura-editorプロジェクトの構造とコーディング規約をまとめたドキュメントです。

## 目次

1. [プロジェクト構造](#プロジェクト構造)
2. [開発環境セットアップ](#開発環境セットアップ)
3. [コード品質ルール](#コード品質ルール)
4. [ディレクトリ規約](#ディレクトリ規約)
5. [開発ワークフロー](#開発ワークフロー)
6. [テスト規約](#テスト規約)
7. [Git運用](#git運用)

---

## プロジェクト構造

### 全体構成

```
sakura-editor/
├── app/                      # Next.js App Router
│   ├── globals.css           # グローバルスタイル
│   ├── layout.tsx            # ルートレイアウト
│   ├── metadata.ts           # メタデータ設定
│   └── page.tsx              # メインページ
├── components/               # Reactコンポーネント
│   ├── editor/               # エディター関連コンポーネント
│   │   ├── EditorContainer.tsx
│   │   ├── EditorToolbar.tsx
│   │   ├── FileTree.tsx
│   │   ├── MonacoEditor.tsx
│   │   └── SearchDialog.tsx
│   ├── settings/             # 設定関連コンポーネント
│   │   ├── SettingsDialog.tsx
│   │   └── tabs/
│   │       ├── AppearanceSettings.tsx
│   │       ├── FileSettings.tsx
│   │       ├── GeneralSettings.tsx
│   │       └── KeyboardSettings.tsx
│   ├── ui/                   # 汎用UIコンポーネント（shadcn/ui）
│   └── ThemeProvider.tsx
├── hooks/                    # カスタムフック
│   ├── use-draggable-dialog.ts
│   └── use-toast.ts
├── lib/                      # ユーティリティ・状態管理
│   ├── i18n/                 # 国際化設定
│   │   ├── index.ts
│   │   └── translations/
│   │       ├── en.ts
│   │       └── ja.ts
│   ├── store/                # Zustand状態管理
│   │   ├── editor-instance-store.ts  # Monaco Editorインスタンス管理
│   │   ├── file-store.ts             # ファイル管理
│   │   └── search-store.ts           # 検索機能
│   ├── types/                # 型定義
│   │   └── editor.ts
│   ├── store.ts              # エディター設定ストア
│   └── utils.ts              # 共通ユーティリティ（cn関数等）
├── .eslintrc.json            # ESLint設定
├── next.config.js            # Next.js設定
├── package.json              # 依存関係
├── postcss.config.js         # PostCSS設定
├── tailwind.config.ts        # Tailwind CSS設定
└── tsconfig.json             # TypeScript設定
```

### ディレクトリの役割

| ディレクトリ | 役割 |
|-------------|------|
| `app/` | Next.js App Routerのルート・ページ |
| `components/editor/` | エディター固有のコンポーネント |
| `components/settings/` | 設定画面のコンポーネント |
| `components/ui/` | 再利用可能なUIコンポーネント（shadcn/ui） |
| `hooks/` | カスタムReactフック |
| `lib/store/` | Zustandによる状態管理 |
| `lib/types/` | TypeScript型定義 |
| `lib/i18n/` | 国際化・翻訳ファイル |

### ストア構成

| ストア | 役割 |
|--------|------|
| `lib/store.ts` | エディター設定（フォント、テーマ等）の永続化 |
| `lib/store/file-store.ts` | ファイル管理（開いているファイル、アクティブファイル） |
| `lib/store/search-store.ts` | 検索機能（検索条件、マッチ結果） |
| `lib/store/editor-instance-store.ts` | Monaco Editorインスタンスの共有 |

---

## 開発環境セットアップ

### 前提条件

- Node.js 18以上
- npm

### 技術スタック

- **フレームワーク**: Next.js 13.5（App Router）
- **言語**: TypeScript 5.2
- **状態管理**: Zustand
- **UIライブラリ**: shadcn/ui + Radix UI
- **エディター**: Monaco Editor
- **スタイリング**: Tailwind CSS
- **フォーム**: React Hook Form + Zod
- **国際化**: i18next + react-i18next

### 初期セットアップ

```bash
# 1. プロジェクトクローン
git clone <repository-url>
cd sakura-editor

# 2. 依存関係インストール
npm install

# 3. 開発サーバー起動
npm run dev
```

### 利用可能なスクリプト

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run start    # プロダクションサーバー起動
npm run lint     # ESLintによるコードチェック
```

---

## コード品質ルール

### 基本原則

1. **型安全性**: TypeScriptの型を最大限活用
2. **一貫性**: プロジェクト全体で統一されたコーディングスタイル
3. **可読性**: コードは書くより読む時間の方が長い
4. **保守性**: 将来の変更に備えた設計

### コーディング規約

#### 関数定義

- **原則としてアロー関数を使用**: `const functionName = () => {}`
- **関数名は意図を表現**: `useCalculatePosition`のように「なぜ」を示す
- **単一責任原則**: 各関数・コンポーネントは1つの責務のみ
- **不要なコメントは書かない**: 振る舞いがコードから明確に読み取れる場合はコメントを避ける

```typescript
// 良い例
const calculateTotalPrice = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// 悪い例
function calc(items) {
  // 計算と表示を同時に行う（単一責任原則違反）
}
```

#### null/undefined の扱い

- **null合体演算子（??）に頼らずガード節で分岐する**: 意図を明確にし、分岐漏れを防ぐ

```typescript
// 悪い例（挙動が読みにくい）
const value = a?.b?.c ?? d ?? e ?? []

// 良い例（ガード節で明示的に分岐）
const getValue = () => {
  if (a && a.b && a.b.c) return a.b.c
  if (d) return d
  if (e) return e
  return []
}
```

#### export規則

- **`export *` は使用禁止**: 必ず名前付きexportを使用
- **exportは最小限に**: 外部から実際に使用されるもののみexport
- **内部実装は隠蔽**: 内部でのみ使用されるhooks、コンポーネント、ユーティリティはexportしない

```typescript
// 良い例
export const PublicComponent = () => {}
const InternalHelper = () => {} // exportしない

// 悪い例
export * from './components' // すべてexportしてしまう
```

#### ファイル末尾

- **必ず空白行を入れる**

### コンポーネント設計

#### 配置原則

- **使用場所の近くに配置**: コンポーネントは使用元のディレクトリ内に配置
- **Propsの責務分離**: `onAdd`/`onEdit`のように責務を分離
- **不要な情報を渡さない**: 位置情報などは親で管理

#### 型定義

- **`ComponentProps<typeof Component>` で重複回避**

```typescript
// 良い例
type ButtonProps = ComponentProps<typeof Button>

// 悪い例
type ButtonProps = {
  onClick: () => void
  children: ReactNode
  // ... 重複定義
}
```

#### メモ化

- **useMemo/useCallbackは全て使用**: 特に子への props は必須

#### スタイリング

- **Tailwindクラスを使用**: `cva`/`cn`活用
- **`style`は動的な数値のみ許可**: 静的なスタイルはTailwindクラスで

### ロジックの切り出し方針

#### 純粋関数にする場合

- React依存なし（state、effect不要）
- テスト容易性を重視
- 例: `calculateTotal()`, `formatDate()`, `validateInput()`

```typescript
// 純粋関数の例
export const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

#### カスタムフックにする場合

- React機能が必要（useState、useEffect等）
- コンポーネント間でステートフルなロジック共有
- 例: `useDraggableDialog()`, `useToast()`

```typescript
// カスタムフックの例
export const useDraggableDialog = (isOpen: boolean, dialogRef: RefObject<HTMLDivElement>) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  // ...
  return { position, isDragging, handleMouseDown, ... }
}
```

---

## ディレクトリ規約

### コンポーネントの配置

```
components/
├── editor/                   # エディター機能のコンポーネント
│   ├── EditorContainer.tsx   # エディターコンテナ（ステータスバー含む）
│   ├── EditorToolbar.tsx     # ツールバー
│   ├── FileTree.tsx          # ファイルツリー
│   ├── MonacoEditor.tsx      # Monaco Editor ラッパー
│   └── SearchDialog.tsx      # 検索ダイアログ
├── settings/                 # 設定機能のコンポーネント
│   ├── SettingsDialog.tsx
│   └── tabs/                 # 設定タブのコンポーネント
├── ui/                       # 汎用UIコンポーネント（shadcn/ui）
└── ThemeProvider.tsx         # テーマプロバイダー
```

### カスタムフックの配置

```
hooks/
├── use-draggable-dialog.ts   # ドラッグ可能ダイアログ
└── use-toast.ts              # トースト通知
```

### ライブラリ・ユーティリティの配置

```
lib/
├── i18n/                     # 国際化
│   ├── index.ts              # i18n設定
│   └── translations/         # 翻訳ファイル
├── store/                    # Zustandストア
│   ├── editor-instance-store.ts  # Monaco Editorインスタンス
│   ├── file-store.ts             # ファイル管理ストア
│   └── search-store.ts           # 検索機能ストア
├── types/                    # 型定義
│   └── editor.ts             # エディター関連の型
├── store.ts                  # エディター設定ストア
└── utils.ts                  # 共通ユーティリティ（cn関数等）
```

### ファイル命名規則

- **コンポーネント**: `ComponentName.tsx`（PascalCase）
- **フック**: `use-hook-name.ts`（ケバブケース、use-プレフィックス）
- **ストア**: `*-store.ts`（ケバブケース）
- **型定義**: `types.ts` または機能名.ts 内で定義
- **テスト**: `*.test.ts` または `*.test.tsx`

---

## 開発ワークフロー

### 開発コマンド

```bash
# 開発サーバー起動（ホットリロード有効）
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm run start

# ESLintによるコードチェック
npm run lint
```

### パスエイリアス

`tsconfig.json`で設定されたパスエイリアス:

```typescript
// @/* でプロジェクトルートからの絶対パスを使用可能
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/lib/store'
import { useFileStore } from '@/lib/store/file-store'
```

### 状態管理（Zustand）

```typescript
// ストアの定義例
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EditorSettingsState {
  settings: EditorSettings
  updateSettings: (settings: Partial<EditorSettings>) => void
}

export const useEditorStore = create<EditorSettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_EDITOR_SETTINGS,
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
    }),
    { name: 'sakura-editor-settings' }
  )
)
```

### UIコンポーネント（shadcn/ui）

- `components/ui/` 配下にshadcn/uiコンポーネントを配置
- Radix UIをベースにしたアクセシブルなコンポーネント
- Tailwind CSSでスタイリング

```typescript
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
```

---

## テスト規約

### 基本方針

- **UIコンポーネント**: 原則テスト不要（ロジックのみテスト）
- **ビジネスロジック**: 必ずテストを書く
- **カスタムフック**: 複雑なロジックを含む場合はテスト推奨

### ファイル命名・配置

- **ファイル名**: `*.test.ts` または `*.test.tsx`
- **配置**: テスト対象と同じディレクトリに配置

### テスト記述

- **describe/it**: 日本語で記述（可読性向上）
- **テスト構造**: Arrange-Act-Assert パターン

```typescript
describe('calculateTotal', () => {
  it('複数のアイテムの合計を正しく計算する', () => {
    // Arrange
    const items = [
      { id: '1', price: 100 },
      { id: '2', price: 200 },
    ]

    // Act
    const result = calculateTotal(items)

    // Assert
    expect(result).toBe(300)
  })
})
```

---

## Git運用

### ブランチ戦略

- **main**: 本番環境用
- **feature/**: 機能開発
- **fix/**: バグ修正
- **refactor/**: リファクタリング

### コミットメッセージ

- **prefix**: 絵文字またはconventional commits形式
- **本文**: 日本語

```
feat: ユーザー一覧画面を追加

- ユーザー検索機能を実装
- ページネーション対応
```

### コミット前の確認

- **型エラーは必ず修正**: TypeScriptの型チェック
- **リント**: `npm run lint`で確認

---

## 設計思想

1. **関数型プログラミング優先**: 純粋関数中心の設計
2. **コンポーネント分離**: UI・ロジック・状態の明確な分離
3. **型安全性**: TypeScriptとZodによるランタイム検証
4. **アクセシビリティ**: Radix UIベースのアクセシブルなUI
5. **グローバル状態の最小化**: Zustandストアを用途別に分離

---

## トラブルシューティング

### よくあるエラー

1. **型エラー**: TypeScriptの型定義を確認
2. **`Cannot find module`**: `npm install`実行、パスエイリアス確認
3. **ビルドエラー**: `.next`フォルダを削除して再ビルド
4. **Monaco Editorエラー**: `@monaco-editor/react`のバージョン確認

### キャッシュクリア

```bash
# Next.jsキャッシュクリア
rm -rf .next

# node_modules再インストール
rm -rf node_modules
npm install
```

---

最終更新: 2025-11-28
