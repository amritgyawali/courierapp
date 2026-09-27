const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 24 * 60 * 60 * 1000;

/** `0.00`, `185.00`, or `291` when `decimals` is 0. */
export function formatAmount(value: number, decimals = 2) {
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** `Rs. 291` / `Rs. 0.00`. */
export function formatRs(value: number, decimals = 0) {
  return `Rs. ${formatAmount(value, decimals)}`;
}

/** Signed whole number without grouping noise: `-185`, `0`. */
export function formatSigned(value: number) {
  return Math.round(value).toString();
}

/** `Aug 12, 2026 3:15 PM`. */
export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const hours = d.getHours() % 12 || 12;
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${formatDate(d)} ${hours}:${minutes} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
}

/** `Aug 12, 2026`. */
export function formatDate(date: Date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** `20/9/2026` — the numeric style used by the report date filters. */
export function formatDayMonthYear(date: Date) {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

/** Inclusive number of calendar days between two dates (20 → 27 Sep is 8 days). */
export function daysInclusive(from: Date, to: Date) {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS) + 1;
}

/** `Good Morning!` / `Good Afternoon!` / `Good Evening!` for the given time. */
export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return 'Good Morning!';
  if (h < 17) return 'Good Afternoon!';
  return 'Good Evening!';
}

/** First letters of the first and last words: `Trending Shop Nepal` → `TN`. */
export function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
