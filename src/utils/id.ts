/** Random integer in [min, max], using the platform CSPRNG when one is available. */
export function randomInt(min: number, max: number) {
  const span = max - min + 1;
  const crypto = (globalThis as { crypto?: { getRandomValues?: (a: Uint32Array) => Uint32Array } }).crypto;
  if (crypto?.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return min + (buf[0] % span);
  }
  return min + Math.floor(Math.random() * span);
}

/**
 * A fresh six-digit vendor ID, e.g. `482913`. Generated once per install until the vendor API
 * issues real IDs.
 */
export function generateVendorId() {
  return String(randomInt(100000, 999999));
}

/**
 * Time-ordered id with a readable prefix, e.g. `AU-MF8K2X1A7F`. Unlike a counter it cannot
 * collide with ids saved before the app restarted.
 */
export function uniqueId(prefix: string) {
  const time = Date.now().toString(36);
  const salt = randomInt(0, 1295).toString(36).padStart(2, '0');
  return `${prefix}-${time}${salt}`.toUpperCase();
}
