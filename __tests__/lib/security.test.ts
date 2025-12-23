import { describe, it, expect } from 'vitest';
import {
  FILE_SECURITY,
  SEARCH_SECURITY,
  SECURITY_HEADERS,
  validateSearchQuery,
  escapeRegExp,
  sanitizeText,
  isValidUrl,
} from '@/lib/security';

describe('FILE_SECURITY', () => {
  it('should have correct max file size (10MB)', () => {
    expect(FILE_SECURITY.MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
  });

  it('should include common text file extensions', () => {
    const extensions = FILE_SECURITY.ALLOWED_EXTENSIONS;
    expect(extensions).toContain('.txt');
    expect(extensions).toContain('.md');
    expect(extensions).toContain('.ts');
    expect(extensions).toContain('.tsx');
    expect(extensions).toContain('.json');
  });
});

describe('validateSearchQuery', () => {
  describe('plain text search', () => {
    it('should accept valid short queries', () => {
      const result = validateSearchQuery('hello', false);
      expect(result.valid).toBe(true);
    });

    it('should reject queries exceeding max length', () => {
      const longQuery = 'a'.repeat(SEARCH_SECURITY.MAX_QUERY_LENGTH + 1);
      const result = validateSearchQuery(longQuery, false);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('長すぎます');
    });

    it('should accept empty query', () => {
      const result = validateSearchQuery('', false);
      expect(result.valid).toBe(true);
    });
  });

  describe('regex search', () => {
    it('should accept valid regex patterns', () => {
      const result = validateSearchQuery('[a-z]+', true);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid regex syntax', () => {
      const result = validateSearchQuery('[invalid(', true);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('無効な正規表現');
    });

    it('should reject patterns with consecutive quantifiers in string', () => {
      // Patterns like a** are caught as invalid regex first
      const result = validateSearchQuery('a**', true);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject large repetition counts', () => {
      const result = validateSearchQuery('a{101}', true);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('繰り返し回数');
    });

    it('should accept reasonable repetition counts', () => {
      const result = validateSearchQuery('a{1,50}', true);
      expect(result.valid).toBe(true);
    });
  });
});

describe('escapeRegExp', () => {
  it('should escape special regex characters', () => {
    expect(escapeRegExp('.*+?^${}()|[]\\')).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
  });

  it('should not modify regular strings', () => {
    expect(escapeRegExp('hello world')).toBe('hello world');
  });

  it('should handle empty strings', () => {
    expect(escapeRegExp('')).toBe('');
  });

  it('should escape mixed content', () => {
    expect(escapeRegExp('file.txt')).toBe('file\\.txt');
    expect(escapeRegExp('(test)')).toBe('\\(test\\)');
  });
});

describe('SECURITY_HEADERS', () => {
  it('should have CSP header defined', () => {
    expect(SECURITY_HEADERS.CSP).toContain("default-src 'self'");
    expect(SECURITY_HEADERS.CSP).toContain('frame-ancestors');
  });

  it('should have HSTS header defined', () => {
    expect(SECURITY_HEADERS.HSTS).toContain('max-age=');
    expect(SECURITY_HEADERS.HSTS).toContain('includeSubDomains');
  });

  it('should have all required security headers', () => {
    expect(SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS).toBe('nosniff');
    expect(SECURITY_HEADERS.X_FRAME_OPTIONS).toBe('DENY');
    expect(SECURITY_HEADERS.REFERRER_POLICY).toBe('strict-origin-when-cross-origin');
  });
});

describe('sanitizeText', () => {
  it('should escape HTML special characters', () => {
    expect(sanitizeText('<script>')).toBe('&lt;script&gt;');
    expect(sanitizeText('&')).toBe('&amp;');
    expect(sanitizeText('"')).toBe('&quot;');
    expect(sanitizeText("'")).toBe('&#x27;');
  });

  it('should handle complex XSS payloads', () => {
    const xss = '<script>alert("xss")</script>';
    const sanitized = sanitizeText(xss);
    expect(sanitized).not.toContain('<');
    expect(sanitized).not.toContain('>');
    expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('should preserve normal text', () => {
    expect(sanitizeText('Hello World')).toBe('Hello World');
  });

  it('should handle empty strings', () => {
    expect(sanitizeText('')).toBe('');
  });
});

describe('isValidUrl', () => {
  it('should accept valid HTTP URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });

  it('should reject dangerous protocols', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
    expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isValidUrl('file:///etc/passwd')).toBe(false);
  });
});
