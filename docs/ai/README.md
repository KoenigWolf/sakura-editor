# Mochi Editor - AI Development Guide

このドキュメントは、AI コーディングアシスタント（Claude Code, Cursor, GitHub Copilot, ChatGPT など）向けの開発ガイドです。

## 必読ドキュメント

コード変更前に必ず読んでください：

| ドキュメント | 内容 |
|-------------|------|
| [プロジェクト構造](../developments/project-structure-guide.md) | ディレクトリ構成、コーディング規約 |
| [アーキテクチャ](../architecture/README.md) | システム設計、状態管理 |
| [国際化](../i18n/README.md) | UIテキスト変更時 |

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 13.5 (App Router) |
| 言語 | TypeScript 5.2 |
| 状態管理 | Zustand |
| UIライブラリ | shadcn/ui + Radix UI |
| エディタ | Monaco Editor |
| スタイリング | Tailwind CSS |
| 国際化 | i18next + react-i18next |

## プロジェクト構造

```
mochi-editor/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # ルートレイアウト
│   ├── page.tsx              # メインページ
│   └── metadata.ts           # SEOメタデータ
├── components/
│   ├── editor/               # エディタコンポーネント
│   │   ├── EditorContainer.tsx
│   │   ├── EditorToolbar.tsx
│   │   ├── FileTabs.tsx
│   │   ├── MonacoEditor.tsx
│   │   └── SearchDialog.tsx
│   ├── settings/             # 設定ダイアログ
│   │   ├── SettingsDialog.tsx
│   │   └── tabs/
│   └── ui/                   # shadcn/ui コンポーネント
├── lib/
│   ├── store/                # Zustand ストア
│   │   ├── file-store.ts
│   │   ├── search-store.ts
│   │   ├── split-view-store.ts
│   │   └── editor-instance-store.ts
│   ├── i18n/translations/    # 翻訳ファイル
│   │   ├── ja.ts
│   │   └── en.ts
│   ├── types/editor.ts       # 型定義
│   ├── themes/               # カスタムテーマ
│   └── store.ts              # エディタ設定ストア
├── docs/                     # ドキュメント
└── public/                   # 静的ファイル
```

## 主要ストア

| ストア | ファイル | 用途 | 永続化 |
|--------|----------|------|--------|
| EditorStore | `lib/store.ts` | エディタ設定 | ○ |
| FileStore | `lib/store/file-store.ts` | ファイル管理 | ○ |
| SearchStore | `lib/store/search-store.ts` | 検索状態 | × |
| SplitViewStore | `lib/store/split-view-store.ts` | 分割ビュー | × |

## コーディング規約

### 1. ハードコードテキスト禁止

```typescript
// NG
<Button>保存</Button>

// OK
const { t } = useTranslation()
<Button>{t('toolbar.save')}</Button>
```

### 2. 翻訳は両ファイルに追加

```typescript
// lib/i18n/translations/ja.ts
export const ja = {
  toolbar: {
    save: '保存',
  },
}

// lib/i18n/translations/en.ts
export const en = {
  toolbar: {
    save: 'Save',
  },
}
```

### 3. Zustand セレクタを使用

```typescript
// NG
const store = useEditorStore()
const fontSize = store.settings.fontSize

// OK
const fontSize = useEditorStore((state) => state.settings.fontSize)
```

### 4. 絶対インポート

```typescript
// NG
import { Button } from '../../../components/ui/button'

// OK
import { Button } from '@/components/ui/button'
```

### 5. アロー関数

```typescript
// NG
function handleClick() {}

// OK
const handleClick = () => {}
```

### 6. 不要なコメント禁止

コードは自己文書化されているべき。

## よくある作業

### 新しいUI テキストの追加

1. `lib/i18n/translations/ja.ts` にキー追加
2. `lib/i18n/translations/en.ts` にキー追加
3. コンポーネントで `useTranslation()` を使用
4. `t('category.key')` で参照

### 新しい設定の追加

1. `lib/types/editor.ts` - EditorSettings に型追加
2. `lib/types/editor.ts` - DEFAULT_EDITOR_SETTINGS にデフォルト値追加
3. `components/settings/tabs/*.tsx` - UIを追加
4. 両翻訳ファイルにラベル追加

### 新しいストアの追加

1. `lib/store/[name]-store.ts` を作成
2. 既存のストアパターンに従う
3. コンポーネントでセレクタを使用

## コミット前チェック

```bash
npm run build    # 必須: ビルド成功
npm run lint     # 必須: リントパス
```

## 主要ファイル一覧

| 目的 | ファイル |
|------|----------|
| エディタ設定型 | `lib/types/editor.ts` |
| エディタ設定ストア | `lib/store.ts` |
| ファイル管理 | `lib/store/file-store.ts` |
| 日本語翻訳 | `lib/i18n/translations/ja.ts` |
| 英語翻訳 | `lib/i18n/translations/en.ts` |
| メインエディタ | `components/editor/MonacoEditor.tsx` |
| 設定ダイアログ | `components/settings/SettingsDialog.tsx` |
| ツールバー | `components/editor/EditorToolbar.tsx` |

## コード参照形式

ファイル参照時は `file_path:line_number` 形式を使用：

```
例: components/editor/MonacoEditor.tsx:150
```
