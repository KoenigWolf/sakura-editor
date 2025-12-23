# Zen Editor - AI Development Guide

AI コーディングアシスタント向けガイド。

## 必読

| ドキュメント                                                   | 内容                   |
| -------------------------------------------------------------- | ---------------------- |
| [プロジェクト構造](../developments/project-structure-guide.md) | ディレクトリ、規約     |
| [アーキテクチャ](../architecture/README.md)                    | 設計、状態管理         |
| [国際化](../i18n/README.md)                                    | UI テキスト変更時      |

## 技術スタック

Next.js (App Router) / TypeScript / Zustand / shadcn/ui / Monaco Editor / Tailwind CSS / i18next

## 必須ルール

1. **UI テキスト** - ハードコード禁止、`t('key')` を使用
2. **翻訳** - `ja.ts` と `en.ts` 両方に追加
3. **Zustand** - セレクタで使用 `useStore((s) => s.value)`
4. **インポート** - 絶対パス `@/` を使用
5. **関数** - アロー関数を使用
6. **コメント** - 不要なコメント禁止

## 主要ファイル

| 目的           | ファイル                             |
| -------------- | ------------------------------------ |
| エディタ設定型 | `lib/types/editor.ts`                |
| ファイル管理   | `lib/store/file-store.ts`            |
| 翻訳（日/英）  | `lib/i18n/translations/{ja,en}.ts`   |
| メインエディタ | `components/editor/MonacoEditor.tsx` |

## コミット前

```bash
npm run build && npm run lint
```
