/**
 * Validates that a URL is a safe internal path.
 * Prevents open redirect attacks by rejecting:
 * - Absolute URLs (https://evil.com)
 * - Protocol-relative URLs (//evil.com)
 * - URLs with encoded characters that could bypass checks
 */
export function isInternalUrl(url: string): boolean {
  // Must start with exactly one forward slash (not //)
  if (!url.startsWith('/') || url.startsWith('//')) {
    return false;
  }

  // Check for encoded slashes or other bypass attempts
  const decoded = decodeURIComponent(url);
  if (!decoded.startsWith('/') || decoded.startsWith('//')) {
    return false;
  }

  // Reject URLs with protocol indicators
  if (url.includes(':') || decoded.includes(':')) {
    return false;
  }

  return true;
}
