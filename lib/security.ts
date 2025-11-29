/**
 * セキュリティ関連のユーティリティ
 */

// ファイルアップロード制限
export const FILE_SECURITY = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: ['.txt', '.md', '.js', '.ts', '.jsx', '.tsx', '.json', '.html', '.css', '.xml', '.yaml', '.yml', '.toml', '.ini', '.conf', '.sh', '.bash', '.zsh', '.py', '.rb', '.go', '.rs', '.java', '.c', '.cpp', '.h', '.hpp', '.sql', '.graphql', '.vue', '.svelte'],
  // ファイル名で禁止する文字（Windows/Unix両対応）
  FORBIDDEN_FILENAME_CHARS: /[<>:"/\\|?*\x00-\x1f]/g,
} as const;

// 検索制限
export const SEARCH_SECURITY = {
  MAX_QUERY_LENGTH: 1000,
  MAX_REGEX_LENGTH: 500,
  // ReDoS の可能性が高い危険なパターン
  DANGEROUS_REGEX_PATTERNS: [
    /(\w)\1{10,}/,        // 同じ文字が10回以上繰り返し
    /\(\?:[^)]+\)\{[2-9]\d*,\}/, // 大きな繰り返し数
  ],
} as const;

/**
 * ファイルのバリデーション
 */
export const validateFile = (file: File): { valid: boolean; error?: string; sanitizedName: string } => {
  // ファイルサイズチェック
  if (file.size > FILE_SECURITY.MAX_FILE_SIZE) {
    const maxMB = FILE_SECURITY.MAX_FILE_SIZE / 1024 / 1024;
    return {
      valid: false,
      error: `ファイルサイズが大きすぎます（最大${maxMB}MB）`,
      sanitizedName: file.name,
    };
  }

  // 拡張子チェック
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

  // ファイル名のサニタイズ
  const sanitizedName = file.name
    .replace(FILE_SECURITY.FORBIDDEN_FILENAME_CHARS, '_')
    .replace(/\.{2,}/g, '.') // 連続ドットを単一ドットに
    .trim();

  // 空のファイル名チェック
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

/**
 * 検索クエリのバリデーション
 */
export const validateSearchQuery = (query: string, isRegex: boolean): { valid: boolean; error?: string } => {
  // 長さチェック
  const maxLength = isRegex ? SEARCH_SECURITY.MAX_REGEX_LENGTH : SEARCH_SECURITY.MAX_QUERY_LENGTH;
  if (query.length > maxLength) {
    return {
      valid: false,
      error: `検索文字列が長すぎます（最大${maxLength}文字）`,
    };
  }

  // 正規表現の場合の追加チェック
  if (isRegex) {
    // 構文チェック
    try {
      new RegExp(query);
    } catch {
      return {
        valid: false,
        error: '無効な正規表現です',
      };
    }

    // ReDoS パターンチェック（簡易版）
    // ネストされた量指定子のパターンを検出
    const nestedQuantifiers = /(\+|\*|\{[^}]+\})\s*(\+|\*|\{[^}]+\})/;
    if (nestedQuantifiers.test(query)) {
      return {
        valid: false,
        error: '複雑すぎる正規表現パターンです',
      };
    }

    // 極端に長い繰り返しパターン
    const longRepetition = /\{(\d+),?\d*\}/g;
    let match;
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

/**
 * 正規表現のエスケープ
 */
export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * HTMLエスケープ（念のため）
 */
export const escapeHtml = (text: string): string => {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
};
