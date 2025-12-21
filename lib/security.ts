export const FILE_SECURITY = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_EXTENSIONS: ['.txt', '.md', '.js', '.ts', '.jsx', '.tsx', '.json', '.html', '.css', '.xml', '.yaml', '.yml', '.toml', '.ini', '.conf', '.sh', '.bash', '.zsh', '.py', '.rb', '.go', '.rs', '.java', '.c', '.cpp', '.h', '.hpp', '.sql', '.graphql', '.vue', '.svelte'],
  FORBIDDEN_FILENAME_CHARS: /[<>:"/\\|?*\x00-\x1f]/g,
} as const;

export const SEARCH_SECURITY = {
  MAX_QUERY_LENGTH: 1000,
  MAX_REGEX_LENGTH: 500,
  DANGEROUS_REGEX_PATTERNS: [
    /(\w)\1{10,}/,
    /\(\?:[^)]+\)\{[2-9]\d*,\}/,
  ],
} as const;

export const validateFile = (file: File): { valid: boolean; error?: string; sanitizedName: string } => {
  if (file.size > FILE_SECURITY.MAX_FILE_SIZE) {
    const maxMB = FILE_SECURITY.MAX_FILE_SIZE / 1024 / 1024;
    return {
      valid: false,
      error: `ファイルサイズが大きすぎます（最大${maxMB}MB）`,
      sanitizedName: file.name,
    };
  }

  const fileName = file.name.toLowerCase();
  const lastDotIndex = fileName.lastIndexOf('.');
  const ext = lastDotIndex >= 0 ? fileName.substring(lastDotIndex) : '';

  if (ext && !(FILE_SECURITY.ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    return {
      valid: false,
      error: `このファイル形式は対応していません: ${ext}`,
      sanitizedName: file.name,
    };
  }

  const sanitizedName = file.name
    .replace(FILE_SECURITY.FORBIDDEN_FILENAME_CHARS, '_')
    .replace(/\.{2,}/g, '.')
    .trim();

  if (!sanitizedName || sanitizedName === '.' || sanitizedName === '..') {
    return {
      valid: false,
      error: '無効なファイル名です',
      sanitizedName: 'untitled',
    };
  }

  return {
    valid: true,
    sanitizedName,
  };
};

export const validateSearchQuery = (query: string, isRegex: boolean): { valid: boolean; error?: string } => {
  const maxLength = isRegex ? SEARCH_SECURITY.MAX_REGEX_LENGTH : SEARCH_SECURITY.MAX_QUERY_LENGTH;
  if (query.length > maxLength) {
    return {
      valid: false,
      error: `検索文字列が長すぎます（最大${maxLength}文字）`,
    };
  }

  if (isRegex) {
    try {
      new RegExp(query);
    } catch {
      return {
        valid: false,
        error: '無効な正規表現です',
      };
    }

    const nestedQuantifiers = /(\+|\*|\{[^}]+\})\s*(\+|\*|\{[^}]+\})/;
    if (nestedQuantifiers.test(query)) {
      return {
        valid: false,
        error: '複雑すぎる正規表現パターンです',
      };
    }

    const longRepetition = /\{(\d+),?\d*\}/g;
    let match: RegExpExecArray | null;
    while ((match = longRepetition.exec(query)) !== null) {
      const num = parseInt(match[1], 10);
      if (num > 100) {
        return {
          valid: false,
          error: '繰り返し回数が大きすぎます（最大100）',
        };
      }
    }
  }

  return { valid: true };
};

export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
