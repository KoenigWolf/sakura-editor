# エディタコンポーネント

## 概要

Monaco Editor をベースにした高機能コードエディタ。

## アーキテクチャ

```
EditorContainer
├── EditorToolbar      # ツールバー（ファイル操作、検索等）
├── FileTabs           # ファイルタブ
├── MonacoEditor       # エディタ本体
├── SearchDialog       # 検索ダイアログ
├── SettingsDialog     # 設定ダイアログ
└── StatusBar          # ステータスバー
```

## MonacoEditor

### 基本構成

```tsx
// components/editor/MonacoEditor.tsx
export function MonacoEditor() {
  const { t } = useTranslation()
  const activeFile = useFileStore((state) => state.files.find(f => f.id === state.activeFileId))
  const settings = useEditorStore((state) => state.settings)
  const { resolvedTheme } = useTheme()

  const editorOptions = useMemo(() => ({
    fontSize: settings.fontSize,
    fontFamily: settings.fontFamily,
    renderWhitespace: settings.showWhitespace,
    // ...
  }), [settings])

  return (
    <Editor
      height="100%"
      value={activeFile?.content || ''}
      onChange={handleChange}
      onMount={handleEditorDidMount}
      theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs-light'}
      options={editorOptions}
      loading={<div>{t('editor.loading')}</div>}
    />
  )
}
```

### エディタオプション

パフォーマンス最適化のため、不要な機能を無効化:

```typescript
const editorOptions = {
  // 基本設定
  fontSize: settings.fontSize,
  fontFamily: settings.fontFamily,
  lineHeight: settings.lineHeight,
  tabSize: settings.tabSize,
  wordWrap: settings.wordWrap ? 'on' : 'off',
  lineNumbers: settings.showLineNumbers ? 'on' : 'off',
  renderWhitespace: settings.showWhitespace,

  // パフォーマンス最適化
  minimap: { enabled: false },
  quickSuggestions: false,
  folding: false,
  codeLens: false,
  bracketPairColorization: { enabled: false },
  renderLineHighlight: 'line',
  cursorBlinking: 'solid',
  cursorSmoothCaretAnimation: 'off',
  smoothScrolling: false,

  // 自動機能の無効化
  autoClosingBrackets: 'never',
  autoClosingQuotes: 'never',
  autoSurround: 'never',
  autoIndent: 'none',
  formatOnType: false,
  formatOnPaste: false,
}
```

### 設定の即時反映

設定変更時に `updateOptions` でリアルタイム反映:

```typescript
useEffect(() => {
  if (editorRef.current) {
    editorRef.current.updateOptions({
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      lineHeight: settings.lineHeight,
      tabSize: settings.tabSize,
      wordWrap: settings.wordWrap ? 'on' : 'off',
      lineNumbers: settings.showLineNumbers ? 'on' : 'off',
      renderWhitespace: settings.showWhitespace,
    })
  }
}, [settings.fontSize, settings.fontFamily, ...])
```

### テーマ切り替え

```typescript
useEffect(() => {
  if (editorRef.current) {
    const isDark = resolvedTheme === 'dark'
    editorRef.current.updateOptions({
      theme: isDark ? 'vs-dark' : 'vs-light'
    })
  }
}, [resolvedTheme])
```

## エディタ設定

### EditorSettings 型

```typescript
// lib/types/editor.ts
interface EditorSettings {
  fontSize: number
  fontFamily: string
  lineHeight: number
  tabSize: number
  autoSave: boolean
  autoSaveInterval: number
  createBackup: boolean
  wordWrap: boolean
  showLineNumbers: boolean
  showRuler: boolean
  showWhitespace: 'none' | 'boundary' | 'selection' | 'trailing' | 'all'
  theme: 'system' | 'light' | 'dark' | string
  language: 'en' | 'ja'
}
```

### デフォルト設定

```typescript
const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  fontSize: 14,
  fontFamily: 'monospace',
  lineHeight: 1.5,
  tabSize: 2,
  autoSave: true,
  autoSaveInterval: 30,
  createBackup: true,
  wordWrap: true,
  showLineNumbers: true,
  showRuler: true,
  showWhitespace: 'all',
  theme: 'system',
  language: 'en',
}
```

## 空白文字の表示

サクラエディタと同様に空白文字を可視化:

| 値 | 説明 |
|----|------|
| `none` | 表示しない |
| `boundary` | 単語間のみ |
| `selection` | 選択範囲のみ |
| `trailing` | 末尾のみ |
| `all` | すべて表示 |

```typescript
// 設定画面
<Select
  value={settings.showWhitespace}
  onValueChange={(value) => onSettingsChange({ showWhitespace: value })}
>
  <SelectItem value="none">表示しない</SelectItem>
  <SelectItem value="all">すべて表示</SelectItem>
  // ...
</Select>
```

## ファイル管理

### FileStore

```typescript
// lib/store/file-store.ts
interface FileData {
  id: string
  name: string
  content: string
  path: string
  lastModified: number
}

interface FileStore {
  files: FileData[]
  activeFileId: string | null
  addFile: (file: Omit<FileData, 'id'>) => void
  removeFile: (id: string) => void
  updateFile: (id: string, updates: Partial<FileData>) => void
  setActiveFile: (id: string) => void
}
```

### ファイルタブ

```tsx
// components/editor/FileTabs.tsx
export const FileTabs = memo(function FileTabs() {
  const { t } = useTranslation()
  const files = useFileStore((state) => state.files)
  const activeFileId = useFileStore((state) => state.activeFileId)

  return (
    <div className="border-b bg-muted/30">
      {files.map((file) => (
        <button
          key={file.id}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 text-xs rounded',
            file.id === activeFileId && 'bg-background'
          )}
          onClick={() => setActiveFile(file.id)}
        >
          <FileCode2 className="h-3 w-3" />
          <span>{file.name}</span>
          <span
            onClick={(e) => handleClose(e, file)}
            aria-label={t('common.close')}
          >
            <X className="h-2.5 w-2.5" />
          </span>
        </button>
      ))}
    </div>
  )
})
```

## 検索機能

### SearchStore

```typescript
// lib/store/search-store.ts
interface SearchStore {
  isOpen: boolean
  searchTerm: string
  matches: SearchMatch[]
  currentMatchIndex: number
  setIsOpen: (isOpen: boolean) => void
  setSearchTerm: (term: string) => void
  setMatches: (matches: SearchMatch[]) => void
}
```

### 検索オプション

```typescript
interface SearchOptions {
  caseSensitive: boolean
  useRegex: boolean
  wholeWord: boolean
}
```

### 検索の実行

```typescript
const performSearch = useCallback(() => {
  const editor = getEditorInstance()
  if (!editor || !query) return

  const model = editor.getModel()
  if (!model) return

  const searchRegex = createSearchRegex(query, options)
  const newMatches: SearchMatch[] = []

  // テキストを検索
  const text = model.getValue()
  let match: RegExpExecArray | null
  while ((match = searchRegex.exec(text)) !== null) {
    const startPos = model.getPositionAt(match.index)
    const endPos = model.getPositionAt(match.index + match[0].length)
    newMatches.push({
      startLineNumber: startPos.lineNumber,
      startColumn: startPos.column,
      endLineNumber: endPos.lineNumber,
      endColumn: endPos.column,
      text: match[0],
    })
  }

  setMatches(newMatches)
}, [query, options])
```

## ツールバー

### EditorToolbar

```tsx
// components/editor/EditorToolbar.tsx
export function EditorToolbar() {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b bg-muted/40">
      {/* ファイル操作 */}
      <ToolbarButton icon={FilePlus2} tooltip={t('toolbar.newFile')} onClick={handleNewFile} />
      <ToolbarButton icon={HardDriveDownload} tooltip={t('toolbar.save')} onClick={handleSave} />
      <ToolbarButton icon={FolderOpen} tooltip={t('toolbar.load')} onClick={handleLoad} />

      <Separator />

      {/* 編集操作 */}
      <ToolbarButton icon={RotateCcw} tooltip={t('toolbar.undo')} onClick={handleUndo} />
      <ToolbarButton icon={RotateCw} tooltip={t('toolbar.redo')} onClick={handleRedo} />

      <Separator />

      {/* 検索・設定 */}
      <ToolbarButton icon={SearchCheck} tooltip={t('toolbar.search')} onClick={openSearch} />
      <div className="flex-1" />
      <ToolbarButton icon={Cog} tooltip={t('toolbar.settings')} onClick={openSettings} />
    </div>
  )
}
```

## ステータスバー

```tsx
// EditorContainer.tsx 内
<div className="flex items-center justify-between px-2 py-1 text-xs border-t bg-muted/40">
  <div className="flex items-center gap-4">
    <span>{t('status.position', { line: cursorLine, col: cursorColumn })}</span>
    <span>{t('status.document', { lines: lineCount, chars: charCount })}</span>
  </div>
  <div className="flex items-center gap-2">
    <span>{encoding}</span>
    <span>{lineEnding}</span>
  </div>
</div>
```

## キーボードショートカット

| ショートカット | アクション |
|---------------|-----------|
| `Ctrl+N` | 新規ファイル |
| `Ctrl+S` | 保存 |
| `Ctrl+O` | ファイルを開く |
| `Ctrl+Z` | 元に戻す |
| `Ctrl+Y` | やり直し |
| `Ctrl+F` | 検索 |
| `Escape` | ダイアログを閉じる |

```typescript
// キーボードショートカットの設定
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'f':
          e.preventDefault()
          setSearchOpen(true)
          break
        // ...
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```
