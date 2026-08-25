export const TIMEZONE = 'America/La_Paz';

export function formatDateForInput(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}

export function getTodayInTimezone(): Date {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return new Date(parseInt(year!, 10), parseInt(month!, 10) - 1, parseInt(day!, 10));
}

export function getTodayDateString(): string {
  return formatDateForInput(getTodayInTimezone());
}
