---
description: GitHub PRにレビューコメントを投稿
allowed-tools: Bash(gh pr:*), Bash(gh api:*), Bash(git diff:*), Bash(git log:*), Bash(git status:*)
argument-hint: "<PR番号>"
---

GitHub上のプルリクエストをレビューし、結果をGitHubに直接投稿します。

## 引数

$ARGUMENTS - PR番号（必須）

## 手順

1. `gh pr view $ARGUMENTS` でPR情報を取得
2. `gh pr diff $ARGUMENTS` で変更内容を取得
3. 以下の観点でレビュー:
   - バグ・論理エラー
   - セキュリティ問題
   - パフォーマンス問題
   - 型安全性
   - コードスタイル
   - i18n対応

4. レビュー結果をGitHubに投稿

## レビュー投稿

問題がない場合:
```bash
gh pr review $ARGUMENTS --approve --body "レビューコメント"
```

修正が必要な場合:
```bash
gh pr review $ARGUMENTS --request-changes --body "レビューコメント"
```

コメントのみの場合:
```bash
gh pr review $ARGUMENTS --comment --body "レビューコメント"
```

## 出力形式

レビュー本文は以下の形式:

```markdown
## レビュー結果

### 概要
[変更内容の要約]

### 良い点
- ポイント1
- ポイント2

### 指摘事項
#### [重要度] ファイル名:行番号
- **問題**: 問題の説明
- **提案**: 修正案

### 総評
[全体的な評価]
```

## ルール

- PR番号が指定されていない場合はエラーを表示
- Critical/Highの問題がある場合は `--request-changes`
- Medium以下のみの場合は `--comment`
- 問題なしの場合は `--approve`
- 日本語でコメントを記載
