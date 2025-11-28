export const en = {
  settings: {
    actions: {
      save: 'Save Settings',
      reset: 'Reset Settings',
      saved: 'Settings saved successfully'
    },
    general: {
      title: 'General',
      language: {
        label: 'Language',
        options: {
          en: 'English',
          ja: '日本語'
        }
      },
      autoSave: {
        label: 'Enable auto-save',
        interval: 'Auto-save interval (seconds)'
      },
      backup: {
        title: 'Backup',
        createBackup: 'Create backup files'
      }
    },
    appearance: {
      title: 'Appearance',
      font: {
        title: 'Font',
        family: 'Font Family',
        size: 'Font Size'
      },
      display: {
        title: 'Display',
        lineNumbers: 'Show line numbers',
        ruler: 'Show ruler',
        wordWrap: 'Word wrap'
      }
    },
    keyboard: {
      title: 'Keyboard Shortcuts',
      saveFile: 'Save File',
      find: 'Find',
      undo: 'Undo',
      redo: 'Redo',
      reset: 'Reset to Defaults'
    },
    file: {
      encoding: {
        title: 'File Encoding',
        label: 'Default Encoding'
      },
      lineEnding: {
        title: 'Line Endings',
        label: 'Default Line Ending',
        options: {
          lf: 'LF (Unix/macOS)',
          crlf: 'CRLF (Windows)',
          cr: 'CR (Classic Mac)'
        }
      }
    }
  },
  // Search dialog translations
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
