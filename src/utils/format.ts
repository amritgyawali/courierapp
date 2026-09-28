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

/** First letters of the first and last words: `Hasta Pun` → `HP`. */
export function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/** `3:15 PM`. */
export function formatTime(iso: string | Date) {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const hours = d.getHours() % 12 || 12;
  return `${hours}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
}

/** `Sep 28`. */
export function formatShortDate(date: Date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** Compact relative time: `just now`, `12m ago`, `3h ago`, `2d ago`, or a date after a week. */
export function timeAgo(iso: string, now = new Date()) {
  const diff = Math.max(0, now.getTime() - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(new Date(iso));
}

/** `2h 15m` for a duration in milliseconds. */
export function formatDuration(ms: number) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

/** Percentage of `part` in `whole`, rounded, 0 when `whole` is 0. */
export function percent(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}
