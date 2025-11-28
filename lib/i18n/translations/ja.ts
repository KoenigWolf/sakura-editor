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
    backup: {
      title: 'バックアップ',
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
      autoSave: {
        label: '自動保存を有効にする',
        interval: '自動保存の間隔',
        unit: '秒',
      },
      backup: {
        title: 'バックアップ',
        createBackup: 'バックアップファイルを作成',
        description: '編集前のファイルを自動でバックアップ',
      },
    },
    appearance: {
      title: '表示',
      theme: {
        title: 'テーマ',
        label: 'カラーテーマ',
        system: 'システム設定に従う',
        light: 'ライト',
        dark: 'ダーク',
      },
      font: {
        title: 'フォント',
        family: 'フォント名',
        size: 'フォントサイズ',
        system: 'システム',
        preview: {
          alphabet: 'ABCDEFG abcdefg 0123456789',
          japanese: 'あいうえお カキクケコ 漢字',
        },
      },
      display: {
        title: '表示設定',
        lineNumbers: '行番号を表示',
        ruler: 'ルーラーを表示',
        wordWrap: '右端で折り返す',
      },
    },
    keyboard: {
      title: 'キーボードショートカット',
      saveFile: 'ファイルを保存',
      find: '検索',
      undo: '元に戻す',
      redo: 'やり直し',
      reset: 'デフォルトに戻す',
    },
    file: {
      encoding: {
        title: 'ファイルエンコーディング',
        label: 'デフォルトエンコーディング',
        options: {
          'utf-8': { label: 'UTF-8', description: '推奨 - 国際標準' },
          'utf-8-bom': { label: 'UTF-8 (BOM)', description: 'Windows互換' },
          'shift-jis': { label: 'Shift JIS', description: '日本語Windows' },
          'euc-jp': { label: 'EUC-JP', description: '日本語Unix' },
        },
      },
      lineEnding: {
        title: '改行コード',
        label: 'デフォルトの改行コード',
        options: {
          lf: { label: 'LF', description: 'Unix / macOS / Linux' },
          crlf: { label: 'CRLF', description: 'Windows' },
          cr: { label: 'CR', description: 'Classic Mac' },
        },
      },
      preview: '新規ファイルは UTF-8 + LF で作成されます',
    },
  },
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
      next: '次を検索',
      previous: '前を検索',
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
  toolbar: {
    newFile: '新規作成',
    save: '保存',
    load: '読み込み',
    undo: '元に戻す',
    redo: 'やり直し',
    search: '検索',
    split: '分割',
    settings: '設定',
  },
  status: {
    loading: '読み込み中...',
    untitled: 'untitled.txt',
    dark: 'ダークモード',
    light: 'ライトモード',
    position: '{{line}}行, {{col}}列',
    document: '{{lines}}行 / {{chars}}文字',
  },
};
