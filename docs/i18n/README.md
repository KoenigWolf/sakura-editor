# 国際化 (i18n) ガイド

## 概要

Mochi Editor は i18next を使用して日本語と英語の多言語対応を実現しています。

## ファイル構成

```
lib/i18n/
├── index.ts           # i18next 設定
└── translations/
    ├── ja.ts          # 日本語翻訳
    └── en.ts          # 英語翻訳
```

## 翻訳ファイルの構造

```typescript
// lib/i18n/translations/ja.ts
export const ja = {
  common: {
    close: '閉じる',
  },
  editor: {
    loading: 'エディタを読み込み中...',
  },
  settings: {
    title: '設定',
    actions: {
      save: '保存',
      reset: 'リセット',
      saved: '設定を保存しました',
      resetDone: '設定をリセットしました',
    },
    general: {
      title: '一般',
      language: {
        label: '言語',
        options: {
          en: 'English',
          ja: '日本語',
        },
      },
      // ...
    },
    // ...
  },
  search: {
    title: '検索・置換',
    placeholder: '検索する文字列を入力...',
    // ...
  },
  toolbar: {
    newFile: '新規作成',
    save: '保存',
    // ...
  },
  status: {
    loading: '読み込み中...',
    position: '{{line}}行, {{col}}列',
    document: '{{lines}}行 / {{chars}}文字',
  },
}
```

## キーの命名規則

### 階層構造

```
{カテゴリ}.{サブカテゴリ}.{キー}
```

| カテゴリ | 説明 |
|---------|------|
| `common` | 共通で使用するテキスト |
| `editor` | エディタ関連 |
| `settings` | 設定画面 |
| `search` | 検索ダイアログ |
| `toolbar` | ツールバー |
| `status` | ステータスバー |

### 例

```typescript
// 共通
common.close           // 閉じる

// 設定画面
settings.title                          // 設定
settings.actions.save                   // 保存
settings.general.title                  // 一般
settings.general.language.label         // 言語
settings.appearance.font.family         // フォント名
settings.file.encoding.options.utf-8    // UTF-8 の説明

// 検索
search.title                // 検索・置換
search.options.caseSensitive // 大文字小文字を区別
search.actions.search       // 検索
search.errors.emptyQuery    // 検索文字列が空です
```

## 使用方法

### コンポーネント内での使用

```tsx
import { useTranslation } from 'react-i18next'

export function MyComponent() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('settings.title')}</h1>
      <Button>{t('settings.actions.save')}</Button>
    </div>
  )
}
```

### 変数を含むテキスト

```tsx
// 翻訳ファイル
position: '{{line}}行, {{col}}列'

// 使用
{t('status.position', { line: 10, col: 5 })}
// 出力: "10行, 5列"
```

### ネストされたオブジェクト

```typescript
// 翻訳ファイル
file: {
  encoding: {
    options: {
      'utf-8': { label: 'UTF-8', description: '推奨 - 国際標準' },
    },
  },
}

// 使用
{t('settings.file.encoding.options.utf-8.label')}       // UTF-8
{t('settings.file.encoding.options.utf-8.description')} // 推奨 - 国際標準

// 動的キー
{t(`settings.file.encoding.options.${value}.label`)}
```

## 新しい翻訳を追加する手順

### 1. 両方の翻訳ファイルにキーを追加

```typescript
// ja.ts
export const ja = {
  // ...
  myFeature: {
    title: '新機能',
    description: 'これは新しい機能です',
  },
}

// en.ts
export const en = {
  // ...
  myFeature: {
    title: 'New Feature',
    description: 'This is a new feature',
  },
}
```

### 2. コンポーネントで使用

```tsx
const { t } = useTranslation()
return <h1>{t('myFeature.title')}</h1>
```

## 言語切り替え

```tsx
import { useTranslation } from 'react-i18next'

export function LanguageSelector() {
  const { i18n } = useTranslation()

  const handleLanguageChange = (value: 'en' | 'ja') => {
    i18n.changeLanguage(value)
    // 設定ストアにも保存
    onSettingsChange({ language: value })
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => handleLanguageChange('ja')}>日本語</button>
      <button onClick={() => handleLanguageChange('en')}>English</button>
    </div>
  )
}
```

## 翻訳ファイルのメンテナンス

### コードの整理

- コメントは不要（キー名で意図が明確になるよう命名）
- 一貫したフォーマット（trailing comma を使用）
- アルファベット順または論理的な順序で整理

```typescript
// 良い例
export const ja = {
  common: {
    close: '閉じる',
  },
  editor: {
    loading: 'エディタを読み込み中...',
  },
  settings: {
    title: '設定',
    actions: {
      reset: 'リセット',
      save: '保存',
    },
  },
}
```

### 両ファイルの同期

`ja.ts` と `en.ts` は同じ構造を維持:

```typescript
// 構造が一致していることを確認
type TranslationKeys = typeof ja
const en: TranslationKeys = {
  // ja.ts と同じキー構造
}
```

## aria-label での使用

アクセシビリティのために aria-label でも翻訳を使用:

```tsx
<Button aria-label={t('common.close')}>
  <X />
</Button>

<Button aria-label={t('search.actions.previous')}>
  <ChevronUp />
</Button>
```

## よくあるパターン

### オプションリスト

```typescript
// 翻訳ファイル
whitespace: {
  label: '空白文字を表示',
  options: {
    none: '表示しない',
    all: 'すべて表示',
  },
}

// コンポーネント
const OPTIONS = ['none', 'all'] as const

{OPTIONS.map((value) => (
  <SelectItem key={value} value={value}>
    {t(`settings.appearance.display.whitespace.options.${value}`)}
  </SelectItem>
))}
```

### ラベル + 説明

```typescript
// 翻訳ファイル
encoding: {
  options: {
    'utf-8': { label: 'UTF-8', description: '推奨 - 国際標準' },
  },
}

// コンポーネント
<SelectionCard
  label={t(`settings.file.encoding.options.${value}.label`)}
  description={t(`settings.file.encoding.options.${value}.description`)}
/>
```

### 単位付きテキスト

```typescript
// 翻訳ファイル
autoSave: {
  interval: '自動保存の間隔',
  unit: '秒',
}

// コンポーネント
<span>{settings.autoSaveInterval}{t('settings.general.autoSave.unit')}</span>
// 出力: "30秒"
```
