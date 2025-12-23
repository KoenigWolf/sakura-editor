# よくある作業（How-to）

## UI テキストを追加する（i18n）

前提：UI テキストはハードコード禁止。翻訳は `ja.ts` / `en.ts` の両方に追加する。

1. `lib/i18n/translations/ja.ts` にキーを追加
2. `lib/i18n/translations/en.ts` に同じキーを追加（構造を一致させる）
3. コンポーネントで `useTranslation()` を使い、`t('...')` で参照

詳細は [国際化 (i18n) ガイド](../i18n/README.md) を参照。

## 新しい設定を追加する

1. `lib/types/editor.ts` の `EditorSettings` に型を追加
2. `lib/types/editor.ts` の `DEFAULT_EDITOR_SETTINGS` にデフォルト値を追加
3. `components/settings/tabs/` に UI を追加
4. 追加した UI ラベルを `ja.ts` / `en.ts` の両方に追加

## 新しいストアを追加する（Zustand）

1. `lib/store/` に `[name]-store.ts` を作成
2. 既存のストアパターン（アクション定義、セレクタ利用）に合わせる
3. コンポーネント側はストア全体を取らず、セレクタで必要な値だけ取得する

## テストを追加する

1. `__tests__/` 配下に `*.test.ts` または `*.test.tsx` を作成
2. AAA パターン（Arrange → Act → Assert）で記述
3. テスト実行：`npm run test:run`

```typescript
import { describe, it, expect } from 'vitest';

describe('機能名', () => {
  it('期待する動作', () => {
    // Arrange: 準備
    const input = 'test';

    // Act: 実行
    const result = someFunction(input);

    // Assert: 検証
    expect(result).toBe('expected');
  });
});
```

## カスタムフックを追加する

1. `hooks/` に `use-[name].ts` を作成
2. `'use client';` ディレクティブを先頭に追加
3. フック名は `use` で始める

```typescript
'use client';

import { useState, useCallback } from 'react';

export const useMyHook = () => {
  const [state, setState] = useState(false);

  const toggle = useCallback(() => {
    setState((prev) => !prev);
  }, []);

  return { state, toggle };
};
```

## アクセシビリティ対応を追加する

### aria-live アナウンス

```typescript
import { useAnnouncerStore } from '@/lib/store/announcer-store';

const announce = useAnnouncerStore((state) => state.announce);

// 通知を送信
announce('操作が完了しました');
announce('エラーが発生しました', 'assertive'); // 緊急通知
```

### フォーカストラップ（モーダル用）

```typescript
import { useFocusTrap } from '@/hooks/use-focus-trap';

const MyDialog = ({ isOpen }: { isOpen: boolean }) => {
  const dialogRef = useFocusTrap<HTMLDivElement>({ isActive: isOpen });

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true">
      {/* ダイアログ内容 */}
    </div>
  );
};
```

## PR 前の確認

コミット時に Husky が自動で lint/format を実行しますが、手動確認も可能：

```bash
npm run test:run      # テスト
npm run typecheck     # 型チェック
npm run build         # ビルド
```

## CI/CD パイプライン

GitHub にプッシュすると以下が自動実行されます：

1. **lint** - ESLint チェック
2. **typecheck** - TypeScript 型チェック
3. **test** - Vitest テスト実行
4. **build** - プロダクションビルド

