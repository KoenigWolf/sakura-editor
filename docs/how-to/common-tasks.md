# よくある作業（How-to）

## UI テキストを追加する（i18n）

前提：UI テキストはハードコード禁止。翻訳は `ja.ts` / `en.ts` の両方に追加する。

- 1) `lib/i18n/translations/ja.ts` にキーを追加
- 2) `lib/i18n/translations/en.ts` に同じキーを追加（構造を一致させる）
- 3) コンポーネントで `useTranslation()` を使い、`t('...')` で参照

詳細は [国際化 (i18n) ガイド](../i18n/README.md) を参照。

## 新しい設定を追加する

- 1) `lib/types/editor.ts` の `EditorSettings` に型を追加
- 2) `lib/types/editor.ts` の `DEFAULT_EDITOR_SETTINGS` にデフォルト値を追加
- 3) `components/settings/tabs/` に UI を追加
- 4) 追加した UI ラベルを `ja.ts` / `en.ts` の両方に追加

## 新しいストアを追加する（Zustand）

- 1) `lib/store/` に `[name]-store.ts` を作成
- 2) 既存のストアパターン（アクション定義、セレクタ利用）に合わせる
- 3) コンポーネント側はストア全体を取らず、セレクタで必要な値だけ取得する

## PR 前の確認

```bash
npm run build && npm run lint
```

