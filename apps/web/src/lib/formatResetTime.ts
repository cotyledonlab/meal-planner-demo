/**
 * Format a reset time for display in the UI.
 * Returns a localized time string (e.g., "2:30 PM") or "soon" if the date is invalid.
 */
export function formatResetTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'soon';
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
