# UI コンポーネント設計ガイド

## 概要

サクラエディタでは shadcn/ui をベースにした UI コンポーネントを使用しています。
このガイドでは、UI コンポーネントの設計原則とカスタマイズ方法を説明します。

## ボタン

### 基本スタイル

すべてのボタンに適用される基本スタイル:

```typescript
// components/ui/button.tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ' +
  'ring-offset-background transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-50 ' +
  'active:scale-[0.98]',  // クリック時の縮小エフェクト
  { ... }
)
```

### バリアント

| バリアント | 用途 | スタイル |
|-----------|------|----------|
| `default` | プライマリアクション | 背景色: primary, シャドウあり |
| `secondary` | セカンダリアクション | 背景色: secondary |
| `outline` | 控えめなアクション | ボーダーのみ、ホバーで背景 |
| `ghost` | 最小限のアクション | 背景なし、ホバーで背景 |
| `destructive` | 破壊的アクション | 赤系の警告色 |
| `link` | リンクスタイル | 下線、テキストカラー |

### サイズ

| サイズ | クラス | 用途 |
|--------|--------|------|
| `default` | `h-10 px-4 py-2` | 標準 |
| `sm` | `h-9 rounded-md px-3` | コンパクト |
| `lg` | `h-11 rounded-lg px-8` | 大きめ |
| `icon` | `h-10 w-10` | アイコンのみ |

### 使用例

```tsx
// プライマリボタン
<Button onClick={handleSave}>保存</Button>

// アウトラインボタン
<Button variant="outline" onClick={handleReset}>リセット</Button>

// アイコンボタン（ツールバー）
<Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
  <FilePlus2 className="h-4 w-4" />
</Button>

// アイコン + テキスト
<Button size="sm">
  <CaseSensitive className="h-3.5 w-3.5" />
  大文字小文字を区別
</Button>
```

### ツールバーボタン

ツールバーのボタンには追加のスタイルを適用:

```tsx
<Button
  variant="ghost"
  size="sm"
  className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary"
>
  <IconComponent className="h-4 w-4" />
</Button>
```

## ダイアログ

### 設定ダイアログ

ドラッグ・リサイズ可能なカスタムダイアログ。

```tsx
// 構造
<>
  {/* オーバーレイ */}
  <div className="fixed inset-0 bg-black/50 z-40" />

  {/* ダイアログ本体 */}
  <div
    ref={dialogRef}
    className="fixed z-50 bg-background border rounded-lg shadow-lg"
    style={{ left: position.x, top: position.y, width, height }}
  >
    {/* リサイズハンドル */}
    <div className="cursor-n-resize" onMouseDown={(e) => handleResizeStart(e, 'n')} />

    {/* ドラッグ可能なヘッダー */}
    <div className="cursor-move" onMouseDown={handleMouseDown}>
      <h2>タイトル</h2>
      <CloseButton onClick={onClose} />
    </div>

    {/* コンテンツ */}
    <div className="flex-1 overflow-auto">
      {children}
    </div>

    {/* フッター */}
    <div className="border-t">
      <Button variant="outline">キャンセル</Button>
      <Button>保存</Button>
    </div>
  </div>
</>
```

### 検索ダイアログ

非モーダルで常に表示可能な検索ダイアログ。

```tsx
// ヘッダー
<div className="flex items-center justify-between">
  <div className="flex items-center gap-2">
    <SearchCheck className="h-4 w-4" />
    <span>1 / 10 件</span>
  </div>
  <div className="flex items-center gap-1">
    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
      <ChevronUp />
    </Button>
    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
      <ChevronDown />
    </Button>
    <CloseButton />
  </div>
</div>
```

## 閉じるボタン

統一されたスタイルの閉じるボタンコンポーネント。

```tsx
// components/ui/close-button.tsx
interface CloseButtonProps {
  onClick: () => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'subtle'
}

export function CloseButton({ onClick, size = 'md', variant = 'default' }: CloseButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        'hover:bg-destructive/90 hover:text-white',
        'active:scale-95',
        sizeClasses[size],
        variantClasses[variant]
      )}
    >
      <X className={cn(iconSizes[size], 'stroke-[2.5]')} />
    </button>
  )
}
```

## フォーム要素

### 入力フィールド

```tsx
<div className="relative">
  <Input
    value={value}
    onChange={onChange}
    placeholder="検索..."
    className="pl-8 pr-24 h-10"
  />
  <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
</div>
```

### セレクト

```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="flex-1 h-8">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">オプション1</SelectItem>
    <SelectItem value="option2">オプション2</SelectItem>
  </SelectContent>
</Select>
```

### スイッチ

```tsx
<div className="flex items-center justify-between">
  <Label>設定項目</Label>
  <Switch checked={checked} onCheckedChange={setChecked} />
</div>
```

## 設定画面のセクション

統一されたセクションレイアウト。

```tsx
function SettingsSection({ icon: Icon, title, children }) {
  return (
    <div className="rounded-lg border bg-card/50 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="p-3">
        {children}
      </div>
    </div>
  )
}
```

## カラーパレット

### テーマカラー

Tailwind CSS の CSS 変数を使用:

| 変数 | 用途 |
|------|------|
| `--background` | 背景色 |
| `--foreground` | テキスト色 |
| `--primary` | プライマリカラー |
| `--secondary` | セカンダリカラー |
| `--muted` | 控えめな要素 |
| `--accent` | アクセント |
| `--destructive` | 警告・削除 |

### 使用例

```tsx
// 背景色
className="bg-background"
className="bg-muted/50"
className="bg-primary/10"

// テキスト色
className="text-foreground"
className="text-muted-foreground"
className="text-primary"

// ボーダー
className="border border-input"
className="border-primary"
```

## アニメーション

### トランジション

```tsx
// 基本のトランジション
className="transition-all duration-200"

// 色の変化のみ
className="transition-colors"

// ホバー時のスケール
className="hover:scale-105 active:scale-[0.98]"
```

### ホバーエフェクト

```tsx
// ボタンホバー
className="hover:bg-primary/10 hover:text-primary"

// 削除ボタンホバー
className="hover:bg-destructive/10 hover:text-destructive"

// リスト項目ホバー
className="hover:bg-accent"
```

## アクセシビリティ

### キーボード操作

```tsx
<button
  onClick={onClick}
  onKeyDown={(e) => e.key === 'Enter' && onClick()}
  tabIndex={0}
  aria-label="閉じる"
>
  <X />
</button>
```

### フォーカス状態

```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

### ARIA 属性

```tsx
<Button aria-label={t('search.actions.previous')} disabled={matches.length === 0}>
  <ChevronUp />
</Button>
```

## レスポンシブデザイン

```tsx
// グリッドレイアウト
className="grid grid-cols-1 lg:grid-cols-[2fr,1fr]"

// パディング
className="p-3 lg:p-4"

// 表示/非表示
className="hidden lg:block"
```
