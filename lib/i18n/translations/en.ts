export const en = {
  common: {
    close: 'Close',
  },
  editor: {
    loading: 'Loading editor...',
  },
  settings: {
    title: 'Settings',
    actions: {
      save: 'Save Settings',
      reset: 'Reset Settings',
      saved: 'Settings saved successfully',
      resetDone: 'Settings have been reset',
    },
    backup: {
      title: 'Backup',
    },
    general: {
      title: 'General',
      language: {
        label: 'Language',
        options: {
          en: 'English',
          ja: '日本語',
        },
      },
      autoSave: {
        label: 'Enable auto-save',
        interval: 'Auto-save interval',
        unit: 'sec',
      },
      backup: {
        title: 'Backup',
        createBackup: 'Create backup files',
        description: 'Automatically backup files before editing',
      },
    },
    appearance: {
      title: 'Appearance',
      theme: {
        title: 'Theme',
        label: 'Color Theme',
        system: 'System',
        light: 'Light',
        dark: 'Dark',
      },
      font: {
        title: 'Font',
        family: 'Font Family',
        size: 'Font Size',
        system: 'System',
        preview: {
          alphabet: 'ABCDEFG abcdefg 0123456789',
          japanese: 'あいうえお カキクケコ 漢字',
        },
      },
      display: {
        title: 'Display',
        lineNumbers: 'Show line numbers',
        ruler: 'Show ruler',
        wordWrap: 'Word wrap',
        whitespace: {
          label: 'Show whitespace',
          options: {
            none: 'None',
            boundary: 'Boundary only',
            selection: 'Selection only',
            trailing: 'Trailing only',
            all: 'All',
          },
        },
      },
    },
    keyboard: {
      title: 'Keyboard Shortcuts',
      saveFile: 'Save File',
      find: 'Find',
      undo: 'Undo',
      redo: 'Redo',
      reset: 'Reset to Defaults',
    },
    file: {
      encoding: {
        title: 'File Encoding',
        label: 'Default Encoding',
        options: {
          'utf-8': { label: 'UTF-8', description: 'Recommended - International standard' },
          'utf-8-bom': { label: 'UTF-8 (BOM)', description: 'Windows compatible' },
          'shift-jis': { label: 'Shift JIS', description: 'Japanese Windows' },
          'euc-jp': { label: 'EUC-JP', description: 'Japanese Unix' },
        },
      },
      lineEnding: {
        title: 'Line Endings',
        label: 'Default Line Ending',
        options: {
          lf: { label: 'LF', description: 'Unix / macOS / Linux' },
          crlf: { label: 'CRLF', description: 'Windows' },
          cr: { label: 'CR', description: 'Classic Mac' },
        },
      },
      preview: 'New files will be created with UTF-8 + LF',
    },
  },
  search: {
    title: 'Find & Replace',
    placeholder: 'Enter search text...',
    replacePlaceholder: 'Enter replacement text...',
    searchInput: 'Search text',
    replaceInput: 'Replacement text',
    close: 'Close',
    toggleReplace: 'Toggle replace mode',
    previousHistory: 'Previous search history',
    nextHistory: 'Next search history',
    options: {
      caseSensitive: 'Match case',
      useRegex: 'Use regular expression',
      wholeWord: 'Match whole word',
    },
    results: {
      empty: 'No search results',
      found: 'Found {count} results',
    },
    actions: {
      search: 'Search',
      replace: 'Replace',
      replaceAll: 'Replace All',
      next: 'Next result',
      previous: 'Previous result',
      cancel: 'Cancel',
    },
    errors: {
      emptyQuery: 'Search text is empty',
      enterQuery: 'Please enter search text',
      searchFailed: 'Search failed',
      replaceFailed: 'Replace failed',
      unknown: 'An unknown error occurred',
    },
  },
  toolbar: {
    newFile: 'New File',
    save: 'Save',
    load: 'Load File',
    undo: 'Undo',
    redo: 'Redo',
    search: 'Find',
    split: 'Split Editor',
    settings: 'Settings',
  },
  status: {
    loading: 'Loading...',
    untitled: 'untitled.txt',
    dark: 'Dark mode',
    light: 'Light mode',
    position: '{{line}} ln, {{col}} col',
    document: '{{lines}} lines / {{chars}} chars',
  },
};
