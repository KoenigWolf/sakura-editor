# プロジェクト構造ガイド

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
mochi-editor/
├── app/                      # Next.js App Router
│   ├── globals.css           # グローバルスタイル
│   ├── layout.tsx            # ルートレイアウト
│   ├── metadata.ts           # メタデータ設定
│   └── page.tsx              # メインページ
├── components/               # Reactコンポーネント
│   ├── editor/               # エディター関連コンポーネント
│   │   ├── EditorContainer.tsx
│   │   ├── EditorToolbar.tsx
│   │   ├── FileTabs.tsx
│   │   ├── FileTree.tsx
│   │   ├── MonacoEditor.tsx
│   │   └── SearchDialog.tsx
│   ├── settings/             # 設定関連コンポーネント
│   │   ├── SettingsDialog.tsx
│   │   └── tabs/
│   │       ├── AppearanceSettings.tsx
│   │       ├── FileSettings.tsx
│   │       └── GeneralSettings.tsx
│   ├── ui/                   # 汎用UIコンポーネント（shadcn/ui）
│   └── ThemeProvider.tsx
├── docs/                     # ドキュメント
│   ├── README.md             # ドキュメント目次
│   ├── architecture/         # アーキテクチャ設計
│   ├── components/           # コンポーネント設計
│   ├── developments/         # 開発ガイド
│   └── i18n/                 # 国際化ガイド
├── hooks/                    # カスタムフック
├── lib/                      # ユーティリティ・状態管理
│   ├── i18n/                 # 国際化設定
│   │   ├── index.ts
│   │   └── translations/
│   │       ├── en.ts
│   │       └── ja.ts
│   ├── store/                # Zustand状態管理
│   │   ├── editor-instance-store.ts
│   │   ├── file-store.ts
│   │   └── search-store.ts
│   ├── types/
│   │   └── editor.ts
│   ├── store.ts
│   └── utils.ts
├── public/                   # 静的ファイル
├── .eslintrc.json
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### ディレクトリの役割

| ディレクトリ | 役割 |
|-------------|------|
| `app/` | Next.js App Routerのルート・ページ |
| `components/editor/` | エディター固有のコンポーネント |
| `components/settings/` | 設定画面のコンポーネント |
| `components/ui/` | 再利用可能なUIコンポーネント（shadcn/ui） |
| `docs/` | 開発ドキュメント |
| `hooks/` | カスタムReactフック |
| `lib/store/` | Zustandによる状態管理 |
| `lib/types/` | TypeScript型定義 |
| `lib/i18n/` | 国際化・翻訳ファイル |

### ストア構成

| ストア | 役割 | 永続化 |
|--------|------|--------|
| `lib/store.ts` | エディター設定（フォント、テーマ等） | ○ |
| `lib/store/file-store.ts` | ファイル管理（開いているファイル） | × |
| `lib/store/search-store.ts` | 検索機能（検索条件、マッチ結果） | × |
| `lib/store/editor-instance-store.ts` | Monaco Editorインスタンス | × |

---

## 開発環境セットアップ

### 前提条件

- Node.js 18以上
- npm

### 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 13.5（App Router） |
| 言語 | TypeScript 5.2 |
| 状態管理 | Zustand |
| UIライブラリ | shadcn/ui + Radix UI |
| エディター | Monaco Editor |
| スタイリング | Tailwind CSS |
| 国際化 | i18next + react-i18next |

### 初期セットアップ

```bash
git clone <repository-url>
cd mochi-editor
npm install
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

- アロー関数を使用: `const functionName = () => {}`
- 関数名は意図を表現
- 単一責任原則
- 不要なコメントは書かない

```typescript
// 良い例
const calculateTotalPrice = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

#### null/undefined の扱い

```typescript
// 良い例（ガード節で明示的に分岐）
const getValue = () => {
  if (a && a.b && a.b.c) return a.b.c
  if (d) return d
  return []
}
```

#### export規則

- `export *` は使用禁止
- exportは最小限に
- 内部実装は隠蔽

### コンポーネント設計

- 使用場所の近くに配置
- Propsの責務分離
- `ComponentProps<typeof Component>` で型定義
- useMemo/useCallbackを活用
- Tailwindクラスを使用

---

## ディレクトリ規約

### ファイル命名規則

| 種類 | 規則 | 例 |
|------|------|-----|
| コンポーネント | PascalCase | `ComponentName.tsx` |
| フック | ケバブケース + use- | `use-hook-name.ts` |
| ストア | ケバブケース + -store | `file-store.ts` |
| 型定義 | 機能名.ts | `editor.ts` |
| テスト | *.test.ts(x) | `utils.test.ts` |

### インポートパス

```typescript
// @/* でプロジェクトルートからの絶対パスを使用
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/lib/store'
```

---

## 開発ワークフロー

### 状態管理（Zustand）

```typescript
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
    { name: 'mochi-editor-settings' }
  )
)
```

### セレクタの使用

```typescript
// 良い例: 必要なデータのみ取得
const fontSize = useEditorStore((state) => state.settings.fontSize)

// 悪い例: ストア全体を取得
const store = useEditorStore()
```

### UIコンポーネント（shadcn/ui）

```typescript
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
```

---

## テスト規約

### 基本方針

| 対象 | テスト | 理由 |
|------|--------|------|
| ユーティリティ関数 | ○ | 純粋関数、テストしやすい |
| ストアロジック | ○ | ビジネスロジック集約 |
| UIコンポーネント | △ | 複雑なロジックのみ |

### テスト記述

```typescript
describe('calculateTotal', () => {
  it('複数のアイテムの合計を正しく計算する', () => {
    // Arrange
    const items = [{ id: '1', price: 100 }, { id: '2', price: 200 }]

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

| ブランチ | 用途 |
|---------|------|
| `main` | 本番環境 |
| `feature/` | 機能開発 |
| `fix/` | バグ修正 |
| `refactor/` | リファクタリング |

### コミットメッセージ

```
feat: ユーザー一覧画面を追加

- ユーザー検索機能を実装
- ページネーション対応
```

### コミット前の確認

- 型エラーは必ず修正
- `npm run lint` で確認
- `npm run build` でビルドエラーがないこと

---

## トラブルシューティング

### よくあるエラー

1. **型エラー**: TypeScriptの型定義を確認
2. **`Cannot find module`**: `npm install`実行、パスエイリアス確認
3. **ビルドエラー**: `.next`フォルダを削除して再ビルド
4. **Monaco Editorエラー**: バージョン確認

### キャッシュクリア

```bash
rm -rf .next
rm -rf node_modules && npm install
```

---

## 関連ドキュメント

- [アーキテクチャ](../architecture/README.md)
- [UIコンポーネント](../components/ui-components.md)
- [エディタ](../components/editor.md)
- [国際化](../i18n/README.md)
