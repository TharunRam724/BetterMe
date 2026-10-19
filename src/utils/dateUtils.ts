/**
 * Date utility helpers for BetterMe
 * Ensures all habit and mood records are strictly consistent with the user's local calendar date.
 */

/**
 * Returns a 'YYYY-MM-DD' formatted string based on the user's local timezone.
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns an array of the last N days (inclusive of today) as 'YYYY-MM-DD' strings,
 * ordered chronologically from oldest to newest.
 */
export function getLastNDaysLocal(daysCount: number): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    result.push(getLocalDateString(target));
  }
  return result;
}

/**
 * Format a YYYY-MM-DD date string to a friendly readable label like "Wed, Oct 18"
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Format a YYYY-MM-DD date string to short weekday like "Mon", "Tue"
 */
export function formatShortDay(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}
