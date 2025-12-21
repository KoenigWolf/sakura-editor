# アーキテクチャ

## 概要

Zen Editor は、Next.js App Router をベースにしたモダンな Web エディタです。

```
┌─────────────────────────────────────────────────────────┐
│                      Next.js App                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Toolbar   │  │   Editor    │  │   StatusBar     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                    State Management                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐   │
│  │ Editor   │  │  File    │  │ Search   │  │Instance│   │
│  │ Store    │  │  Store   │  │ Store    │  │ Store  │   │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘   │
├─────────────────────────────────────────────────────────┤
│                    Monaco Editor                        │
└─────────────────────────────────────────────────────────┘
```

## レイヤー構成

### 1. プレゼンテーション層

UI コンポーネントを担当。

```
components/
├── editor/          # エディタ固有のコンポーネント
│   ├── EditorContainer.tsx    # メインコンテナ
│   ├── EditorToolbar.tsx      # ツールバー
│   ├── FileTabs.tsx           # ファイルタブ
│   ├── MonacoEditor.tsx       # エディタ本体
│   └── SearchDialog.tsx       # 検索ダイアログ
├── settings/        # 設定画面
│   ├── SettingsDialog.tsx     # 設定ダイアログ
│   └── tabs/                  # 設定タブ
└── ui/              # 汎用UIコンポーネント（shadcn/ui）
```

### 2. 状態管理層

Zustand を使用したストア構成。

| ストア              | ファイル                             | 役割                               | 永続化 |
| ------------------- | ------------------------------------ | ---------------------------------- | ------ |
| EditorStore         | `lib/store.ts`                       | エディタ設定（フォント、テーマ等） | ○      |
| FileStore           | `lib/store/file-store.ts`            | ファイル管理                       | ○      |
| SearchStore         | `lib/store/search-store.ts`          | 検索状態                           | ×      |
| EditorInstanceStore | `lib/store/editor-instance-store.ts` | Monaco インスタンス                | ×      |

### 3. ドメイン層

型定義とビジネスロジック。

```
lib/
├── types/
│   └── editor.ts    # EditorSettings, EditorFile 等
└── utils.ts         # ユーティリティ関数
```

### 4. インフラ層

外部サービスとの連携。

```
lib/
└── i18n/            # 国際化
    ├── index.ts     # i18next 設定
    └── translations/
        ├── ja.ts    # 日本語
        └── en.ts    # 英語
```

## データフロー

```
User Action
    │
    ▼
┌─────────────────┐
│   Component     │  ← UI イベント
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Zustand       │  ← 状態更新
│   Store         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   React         │  ← 再レンダリング
│   Re-render     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Monaco        │  ← エディタ更新
│   Editor        │
└─────────────────┘
```

## 状態管理の設計原則

### 1. ストアの分離

責務ごとにストアを分離し、依存関係を最小化。

```typescript
// 設定ストア（永続化あり）
const useEditorStore = create<EditorSettingsState>()(
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

// ファイルストア（永続化なし）
const useFileStore = create<FileState>((set) => ({
  files: [],
  activeFileId: null,
  addFile: (file) => set((state) => ({ ... })),
}))
```

### 2. セレクタの活用

不要な再レンダリングを防ぐため、セレクタで必要なデータのみ取得。

```typescript
// 良い例: 必要なデータのみ取得
const settings = useEditorStore((state) => state.settings);
const fontSize = useEditorStore((state) => state.settings.fontSize);

// 悪い例: ストア全体を取得
const store = useEditorStore();
```

### 3. アクションの定義

ストア内にアクションを定義し、状態更新ロジックを集約。

```typescript
interface FileStore {
  files: FileData[];
  activeFileId: string | null;
  // アクション
  addFile: (file: Omit<FileData, "id">) => void;
  removeFile: (id: string) => void;
  setActiveFile: (id: string) => void;
}
```

## Monaco Editor との統合

### インスタンス管理

`EditorInstanceStore` で Monaco Editor インスタンスを管理。

```typescript
const useEditorInstanceStore = create<EditorInstanceState>((set) => ({
  editorInstance: null,
  setEditorInstance: (instance) => set({ editorInstance: instance }),
  getEditorInstance: () => {
    return useEditorInstanceStore.getState().editorInstance;
  },
}));
```

### 設定の同期

エディタ設定変更時に `updateOptions` で同期。

```typescript
useEffect(() => {
  if (editorRef.current) {
    editorRef.current.updateOptions({
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      renderWhitespace: settings.showWhitespace,
      // ...
    });
  }
}, [settings]);
```

## パフォーマンス最適化

### 1. メモ化

```typescript
// useMemo でオプションをメモ化
const editorOptions = useMemo(
  () => ({
    fontSize: settings.fontSize,
    fontFamily: settings.fontFamily,
    // ...
  }),
  [settings]
);

// useCallback でハンドラをメモ化
const handleChange = useCallback(
  (value: string | undefined) => {
    if (activeFileIdRef.current && value !== undefined) {
      updateFile(activeFileIdRef.current, { content: value });
    }
  },
  [updateFile]
);
```

### 2. 遅延読み込み

Monaco Editor は動的インポートで読み込み。

```typescript
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.Editor),
  { ssr: false }
);
```

### 3. エディタオプションの最適化

不要な機能を無効化してパフォーマンス向上。

```typescript
const editorOptions = {
  minimap: { enabled: false },
  quickSuggestions: false,
  folding: false,
  codeLens: false,
  // ...
};
```

## セキュリティ

### CSP (Content Security Policy)

Monaco Editor の Web Worker 用に CSP を設定。

```typescript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' blob:;
  worker-src 'self' blob:;
  style-src 'self' 'unsafe-inline';
`;
```

## テスト戦略

### テスト対象

| 対象               | テスト | 理由                     |
| ------------------ | ------ | ------------------------ |
| ユーティリティ関数 | ○      | 純粋関数、テストしやすい |
| ストアロジック     | ○      | ビジネスロジック集約     |
| UI コンポーネント  | △      | 複雑なロジックのみ       |
| 統合テスト         | ○      | E2E でユーザーフロー確認 |

### テスト構造

```typescript
describe("FileStore", () => {
  it("ファイルを追加できる", () => {
    const { result } = renderHook(() => useFileStore());

    act(() => {
      result.current.addFile({
        name: "test.txt",
        content: "Hello",
      });
    });

    expect(result.current.files).toHaveLength(1);
  });
});
```
