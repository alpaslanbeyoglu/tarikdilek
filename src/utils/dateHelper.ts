/**
 * Utility functions for local timezone-safe date formatting and conversions.
 * Avoids UTC timezone shifts caused by .toISOString().
 */

export function formatLocalDateToISO(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODateToLocal(isoDateStr: string): Date {
  if (!isoDateStr) return new Date();
  const parts = isoDateStr.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0])) return new Date();
  return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
}

export function formatISODateToTurkish(isoDateStr: string): string {
  if (!isoDateStr) return '';
  try {
    const d = parseISODateToLocal(isoDateStr);
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    });
  } catch {
    return isoDateStr;
  }
}
