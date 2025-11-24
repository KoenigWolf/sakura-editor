/**
 * 日本語翻訳リソース
 * 各セクションごとに、設定画面で利用する文言をまとめています。
 */
export const ja = {
  // 設定全般に関する翻訳
  settings: {
    // アクションに関するテキスト
    actions: {
      save: '設定を保存',         // 「設定を保存」ボタン用
      reset: '設定をリセット',      // 「設定をリセット」ボタン用
      saved: '設定を保存しました'   // 設定保存完了時の通知文
    },
    // 一般設定に関するテキスト
    general: {
      title: '一般', // 一般設定セクションのタイトル
      language: {
        label: '言語', // 言語選択のラベル
        options: {
          en: 'English', // 英語表記
          ja: '日本語'   // 日本語表記
        }
      },
      autoSave: {
        label: '自動保存を有効にする',    // 自動保存機能の有効化ラベル
        interval: '自動保存の間隔（秒）'   // 自動保存間隔の説明
      },
      backup: {
        title: 'バックアップ',           // バックアップ設定セクションのタイトル
        createBackup: 'バックアップファイルを作成' // バックアップ作成のオプション
      }
    },
    // 表示（アピアランス）に関する翻訳
    appearance: {
      title: '表示', // 表示設定セクションのタイトル
      font: {
        title: 'フォント',     // フォント設定のセクションタイトル
        family: 'フォント名',  // フォントファミリーのラベル
        size: 'フォントサイズ' // フォントサイズのラベル
      },
      display: {
        title: '表示設定',      // 表示オプションのセクションタイトル
        lineNumbers: '行番号を表示', // 行番号表示のラベル
        ruler: 'ルーラーを表示',      // ルーラー表示のラベル
        wordWrap: '右端で折り返す'     // ワードラップのラベル
      }
    },
    // キーボードショートカットに関する翻訳
    keyboard: {
      title: 'キーボードショートカット', // キーボードショートカット設定のタイトル
      saveFile: 'ファイルを保存',         // 「ファイルを保存」ショートカットの説明
      find: '検索',                      // 「検索」ショートカットの説明
      undo: '元に戻す',                  // 「元に戻す」ショートカットの説明
      redo: 'やり直し',                  // 「やり直し」ショートカットの説明
      reset: 'デフォルトに戻す'           // 「デフォルトに戻す」ショートカットの説明
    },
    // ファイルに関する設定の翻訳
    file: {
      encoding: {
        title: 'ファイルエンコーディング', // エンコーディング設定のタイトル
        label: 'デフォルトエンコーディング' // デフォルトエンコーディングのラベル
      },
      lineEnding: {
        title: '改行コード',          // 改行コード設定のタイトル
        label: 'デフォルトの改行コード', // 改行コード選択のラベル
        options: {
          lf: 'LF (Unix/macOS)',      // LF (Unix/macOS) の表示テキスト
          crlf: 'CRLF (Windows)',     // CRLF (Windows) の表示テキスト
          cr: 'CR (Classic Mac)'      // CR (Classic Mac) の表示テキスト
        }
      }
    }
  },
  // 検索ダイアログに関する翻訳
  search: {
    title: '検索・置換',
    placeholder: '検索する文字列を入力...',
    replacePlaceholder: '置換する文字列を入力...',
    searchInput: '検索文字列',
    replaceInput: '置換文字列',
    close: '閉じる',
    toggleReplace: '置換モードの切り替え',
    previousHistory: '前の検索履歴',
    nextHistory: '次の検索履歴',
    options: {
      caseSensitive: '大文字小文字を区別',
      useRegex: '正規表現を使用',
      wholeWord: '単語単位で検索',
    },
    results: {
      empty: '検索結果がありません',
      found: '{count}件見つかりました',
    },
    actions: {
      search: '検索',
      replace: '置換',
      replaceAll: 'すべて置換',
      cancel: 'キャンセル',
    },
    errors: {
      emptyQuery: '検索文字列が空です',
      enterQuery: '検索する文字列を入力してください',
      searchFailed: '検索に失敗しました',
      replaceFailed: '置換に失敗しました',
      unknown: '不明なエラーが発生しました',
    },
  },
};
