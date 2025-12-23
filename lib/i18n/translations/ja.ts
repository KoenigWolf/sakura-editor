export const ja = {
  common: {
    close: '閉じる',
    tryAgain: '再試行',
    refresh: '更新',
    home: 'ホーム',
  },
  errorBoundary: {
    title: 'エラーが発生しました',
    unexpectedError: '予期しないエラーが発生しました',
    criticalError: '重大なエラー',
    criticalDescription: '重大なエラーが発生しました。ページを更新してください。',
    pageError: '予期しないエラーが発生しました。再試行するか、ホームページに戻ってください。',
  },
  commandPalette: {
    placeholder: 'コマンドを入力...',
    noResults: 'コマンドが見つかりません',
    navigate: 'で移動',
    select: 'で選択',
    commands: '件のコマンド',
    categories: {
      file: 'ファイル',
      edit: '編集',
      view: '表示',
      search: '検索',
      settings: '設定',
    },
    actions: {
      newFile: '新規ファイル',
      openFile: 'ファイルを開く',
      saveFile: 'ファイルを保存',
      closeTab: 'タブを閉じる',
      undo: '元に戻す',
      redo: 'やり直し',
      find: '検索',
      replace: '置換',
      goToLine: '行に移動',
      toggleTheme: 'テーマを切り替え',
      splitVertical: '縦分割',
      splitHorizontal: '横分割',
      closeSplit: '分割を閉じる',
      openSettings: '設定を開く',
      keyboardShortcuts: 'キーボードショートカット',
    },
  },
  error: {
    fileError: 'ファイルエラー',
    fileReadFailed: 'ファイルの読み込みに失敗しました',
    fileTooLarge: 'ファイルサイズが大きすぎます',
    invalidFileType: 'サポートされていないファイル形式です',
    searchQueryTooLong: '検索文字列が長すぎます',
    invalidRegex: '無効な正規表現です',
    complexRegex: '複雑すぎる正規表現パターンです',
  },
  editor: {
    title: 'テキストエディタ',
    loading: 'エディタを読み込み中...',
    fullWidthSpace: '全角スペース (U+3000)',
  },
  settings: {
    title: '設定',
    actions: {
      save: '保存',
      reset: 'リセット',
      saved: '設定を保存しました',
      resetDone: '設定をリセットしました',
    },
    tabs: {
      theme: 'テーマ',
      editor: 'エディタ',
      file: 'ファイル',
      general: '一般',
    },
    theme: {
      title: 'カラーテーマ',
      baseTheme: '基本テーマ',
      system: 'システム',
      light: 'ライト',
      dark: 'ダーク',
      darkThemes: 'ダークテーマ',
      lightThemes: 'ライトテーマ',
    },
    editor: {
      font: {
        title: 'フォント',
        family: 'フォント名',
        size: 'フォントサイズ',
        lineHeight: '行の高さ',
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
        tabSize: 'タブサイズ',
      },
      whitespace: {
        title: '空白文字の表示',
        label: '半角スペース',
        fullWidthLabel: '全角スペース',
        options: {
          none: '表示しない',
          boundary: '単語間のみ',
          selection: '選択範囲のみ',
          trailing: '末尾のみ',
          all: 'すべて表示',
        },
      },
    },
    file: {
      title: 'ファイル',
      autoSave: {
        title: '自動保存',
        enable: '自動保存を有効にする',
        interval: '保存間隔',
        unit: '秒',
      },
      backup: {
        title: 'バックアップ',
        enable: 'バックアップを作成',
        description: '編集前のファイルを自動でバックアップ',
      },
      encoding: {
        title: 'エンコーディング',
        label: 'デフォルト',
        options: {
          'utf-8': { label: 'UTF-8', description: '推奨 - 国際標準' },
          'utf-8-bom': { label: 'UTF-8 (BOM)', description: 'Windows互換' },
          'shift-jis': { label: 'Shift JIS', description: '日本語Windows' },
          'euc-jp': { label: 'EUC-JP', description: '日本語Unix' },
        },
      },
      lineEnding: {
        title: '改行コード',
        label: 'デフォルト',
        options: {
          lf: { label: 'LF', description: 'Unix / macOS / Linux' },
          crlf: { label: 'CRLF', description: 'Windows' },
          cr: { label: 'CR', description: 'Classic Mac' },
        },
      },
    },
    general: {
      title: '一般',
      language: {
        title: '言語',
        label: 'インターフェース言語',
        options: {
          en: { label: 'English', flag: '🇺🇸' },
          ja: { label: '日本語', flag: '🇯🇵' },
        },
      },
    },
  },
  search: {
    title: '検索・置換',
    placeholder: '検索...',
    replacePlaceholder: '置換...',
    searchInput: '検索文字列',
    replaceInput: '置換文字列',
    close: '閉じる',
    toggleReplace: '置換モードの切り替え',
    showReplace: '置換',
    hideReplace: '置換を隠す',
    previousHistory: '前の検索履歴',
    nextHistory: '次の検索履歴',
    replaced: '{{count}}件を置換しました',
    found: '{{count}}件見つかりました',
    noResults: '結果が見つかりませんでした',
    moreResults: '件以上',
    options: {
      caseSensitive: '大文字小文字を区別',
      useRegex: '正規表現',
      wholeWord: '単語単位',
    },
    results: {
      empty: '結果なし',
      found: '{{count}}件',
    },
    actions: {
      search: '検索',
      replace: '置換',
      replaceAll: '全置換',
      next: '次へ',
      previous: '前へ',
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
    indent: 'インデント',
    outdent: 'インデント解除',
    ruler: 'ルーラー表示切替',
    split: '分割',
    splitVertical: '縦分割',
    splitHorizontal: '横分割',
    closeSplit: '分割を閉じる',
    settings: '設定',
    fullscreen: 'フォーカスモード',
    exitFocus: 'タップで戻る',
  },
  indent: {
    ruler: 'インデントルーラー',
    firstLineIndent: '1行目のインデント',
    hangingIndent: 'ぶら下げインデント',
    leftMargin: '左マージン',
    rightMargin: '右マージン',
    tabStop: 'タブ位置',
    clearTabStops: 'すべてのタブ位置をクリア',
    resetIndent: 'インデント設定をリセット',
  },
  status: {
    loading: '読み込み中...',
    untitled: 'untitled.txt',
    dark: 'ダークモード',
    light: 'ライトモード',
    position: '{{line}}行, {{col}}列',
    document: '{{lines}}行 / {{chars}}文字',
    encoding: 'UTF-8',
  },
  app: {
    title: 'Zen Editor',
  },
  fileTree: {
    title: 'ファイル',
  },
  tabMenu: {
    close: 'タブを閉じる',
    closeOthers: '他のタブを閉じる',
    closeAll: 'すべて閉じる',
    duplicate: '複製',
    rename: '名前を変更',
  },
  split: {
    vertical: '横に並べて表示',
    horizontal: '縦に並べて表示',
    splitVertical: '縦分割',
    splitHorizontal: '横分割',
    closePane: 'ペインを閉じる',
    selectFile: 'ペインのファイルを選択',
  },
  accessibility: {
    toggleQuickActions: 'クイックアクションの切り替え',
    toggleTheme: 'テーマの切り替え',
    openCommandPalette: 'コマンドパレットを開く',
    skipToContent: 'メインコンテンツへスキップ',
    mainEditor: 'メインエディタ領域',
    toolbar: 'エディタツールバー',
    statusBar: 'ステータスバー',
  },
  pwa: {
    install: {
      title: 'Zen Editorをインストール',
      desktop: 'デスクトップアプリとして使用',
      mobile: 'ホーム画面に追加',
      button: 'インストール',
      later: '後で',
      next: '次へ',
      done: '完了',
      laterInstall: '後でインストールする',
    },
    benefits: {
      fastStartup: {
        label: '高速起動',
        description: 'ネイティブアプリ並みの速度',
      },
      offline: {
        label: 'オフライン対応',
        description: 'ネット接続なしで動作',
      },
      autoUpdate: {
        label: '自動更新',
        description: '常に最新バージョン',
      },
    },
    ios: {
      title: 'iPhoneに追加',
      steps: '3ステップで完了',
      step1: {
        title: '共有ボタンをタップ',
        description: '画面下部の共有アイコン（□に↑）をタップ',
        highlight: '下部中央のアイコン',
      },
      step2: {
        title: '「ホーム画面に追加」を選択',
        description: 'メニューをスクロールして見つけてください',
        highlight: 'スクロールが必要な場合も',
      },
      step3: {
        title: '「追加」をタップ',
        description: '右上の「追加」ボタンで完了です',
        highlight: '右上のボタン',
      },
    },
    mac: {
      title: 'Macに追加',
      steps: '3ステップで完了',
      step1: {
        title: '共有ボタンをクリック',
        description: 'ツールバーの共有アイコンをクリック',
        highlight: 'アドレスバー付近',
      },
      step2: {
        title: '「Dockに追加」を選択',
        description: 'メニューから「Dockに追加」を選択',
        highlight: 'macOS Sonoma以降',
      },
      step3: {
        title: '「追加」をクリック',
        description: 'ダイアログで「追加」をクリックして完了',
        highlight: '',
      },
    },
    browser: {
      safari: 'Safari経由でインストール',
      chrome: 'Chromeからインストール',
      edge: 'Edgeからインストール',
      default: 'ブラウザからインストール',
    },
    status: {
      online: 'オンラインに復帰しました',
      offline: 'オフラインモード',
    },
    update: {
      available: 'アップデートがあります',
      description: '最新機能を利用できます',
      later: '後で',
      updating: '更新中...',
      now: '今すぐ更新',
    },
  },
  seo: {
    hero: {
      title: 'Zen Editor — 最高クラスの無料オンラインテキストエディタ',
      description:
        'ブラウザで即起動。日本語完全対応、全角スペース表示、Monaco Editor ベースの高速体験。',
      cta: 'インストールもログインも不要。開くだけですぐに書き始められます。',
    },
    features: {
      title: '最新の編集体験を叶える主な特徴',
      summary:
        'メモから Markdown、コードまで快適に扱えるよう、軽快さと開発者向け機能を両立しています。',
      items: [
        {
          title: 'ブラウザですぐ開始',
          description: 'ダウンロードやサインインなしでエディタを即座に開けます。',
        },
        {
          title: '日本語 & 全角スペース対応',
          description: 'IME に配慮した入力と全角スペースの可視化で文字幅を正確に把握できます。',
        },
        {
          title: '開発者向け機能',
          description:
            'Monaco ベースのシンタックスハイライト、コマンドパレット、行移動などで効率的に編集。',
        },
        {
          title: '快適な読みやすさ',
          description:
            'ライト/ダークテーマやルーラー、フォーカスモードで環境に合わせた読書・執筆が可能。',
        },
        {
          title: '強力な検索・置換',
          description: '正規表現検索、置換履歴、ショートカットで大量テキストも素早く操作。',
        },
        {
          title: 'PWA とオフライン',
          description:
            'デスクトップやモバイルにインストールして、オフラインでも編集を続けられます。',
        },
      ],
    },
    trust: {
      title: '安心して使える設計',
      summary: 'データの保存先からパフォーマンスまで、使い続けられる安心感を重視しています。',
      items: [
        {
          title: 'プライバシーファースト',
          description: '編集内容はブラウザ内に保存され、外部サーバーへ自動送信されません。',
        },
        {
          title: 'パフォーマンス最適化',
          description: '重いコンポーネントを遅延読み込みし、モバイルでも軽快な操作性を維持します。',
        },
        {
          title: 'アクセシビリティ対応',
          description:
            'キーボードショートカットや読みやすいデフォルト、スクリーンリーダー配慮で誰でも使いやすく。',
        },
      ],
    },
    faq: {
      title: 'よくある質問',
      items: [
        {
          question: 'Zen Editor は無料で使えますか？',
          answer:
            'はい。アカウント登録や有料プランなしで、すべてのエディタ機能を無料で利用できます。',
        },
        {
          question: 'プログラミング用途にも使えますか？',
          answer:
            'Monaco ベースのシンタックスハイライトやテーマ、空白表示でコードも読みやすく編集できます。',
        },
        {
          question: 'オフラインでも使えますか？',
          answer: 'PWA としてインストールすると、ネットワークがなくても編集を続けられます。',
        },
      ],
    },
  },
};
