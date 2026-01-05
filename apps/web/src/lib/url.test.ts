import { describe, it, expect } from 'vitest';

import { isInternalUrl } from '~/lib/url';

describe('isInternalUrl', () => {
  describe('valid internal URLs', () => {
    it('accepts root path', () => {
      expect(isInternalUrl('/')).toBe(true);
    });

    it('accepts simple paths', () => {
      expect(isInternalUrl('/dashboard')).toBe(true);
      expect(isInternalUrl('/planner')).toBe(true);
      expect(isInternalUrl('/auth/signup')).toBe(true);
    });

    it('accepts paths with query strings', () => {
      expect(isInternalUrl('/planner?tab=preferences')).toBe(true);
      expect(isInternalUrl('/plan/123?view=list')).toBe(true);
    });

    it('accepts paths with fragments', () => {
      expect(isInternalUrl('/docs#section')).toBe(true);
    });
  });

  describe('invalid external URLs', () => {
    it('rejects absolute URLs with http', () => {
      expect(isInternalUrl('http://evil.com')).toBe(false);
      expect(isInternalUrl('http://evil.com/path')).toBe(false);
    });

    it('rejects absolute URLs with https', () => {
      expect(isInternalUrl('https://evil.com')).toBe(false);
      expect(isInternalUrl('https://evil.com/dashboard')).toBe(false);
    });

    it('rejects protocol-relative URLs', () => {
      expect(isInternalUrl('//evil.com')).toBe(false);
      expect(isInternalUrl('//evil.com/path')).toBe(false);
    });

    it('rejects encoded protocol-relative URLs', () => {
      expect(isInternalUrl('/%2Fevil.com')).toBe(false);
      expect(isInternalUrl('/%2f%2fevil.com')).toBe(false);
    });

    it('rejects URLs without leading slash', () => {
      expect(isInternalUrl('dashboard')).toBe(false);
      expect(isInternalUrl('evil.com')).toBe(false);
    });

    it('rejects javascript: protocol', () => {
      expect(isInternalUrl('javascript:alert(1)')).toBe(false);
    });

    it('rejects data: protocol', () => {
      expect(isInternalUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    it('rejects URLs with embedded protocols', () => {
      expect(isInternalUrl('/redirect?to=https://evil.com')).toBe(false);
    });
  });
});
