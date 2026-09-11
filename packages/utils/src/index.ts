// =============================================================================
// @khetly/utils — shared utility functions
// =============================================================================

// ─── Phone ────────────────────────────────────────────────────────────────────

/** Masks a phone number: 9876543210 → +91 98765 ****10 */
export function maskPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '').slice(-10)
  return `+91 ${clean.slice(0, 5)} ****${clean.slice(-2)}`
}

/** Normalises phone to 10-digit string, strips country code */
export function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length === 12) return digits.slice(2)
  return digits.slice(-10)
}

/** Validates Indian mobile number (starts with 6-9, 10 digits) */
export function isValidIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(normalisePhone(phone))
}

// ─── Currency ─────────────────────────────────────────────────────────────────

/** Format number as Indian rupee: 42000 → ₹42,000 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format compact: 150000 → ₹1.5L */
export function formatINRCompact(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`
  return `₹${amount}`
}

// ─── Distance ─────────────────────────────────────────────────────────────────

/** Haversine formula — distance between two geo points in km */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

/** Format distance: 1.2 km or 850 m */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

// ─── Strings ──────────────────────────────────────────────────────────────────

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen - 1) + '…'
}

export function initials(name: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
  )
}

// ─── Numbers ──────────────────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/** Platform fee calculation: 8% of total */
export function calcPlatformFee(amount: number, feePercent = 8): {
  platformFee: number
  farmerReceives: number
} {
  const platformFee = Math.round((amount * feePercent) / 100)
  return { platformFee, farmerReceives: amount - platformFee }
}

// ─── Arrays ───────────────────────────────────────────────────────────────────

export function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item)
    ;(acc[k] ??= []).push(item)
    return acc
  }, {})
}

export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

// ─── OTP ─────────────────────────────────────────────────────────────────────

/** Generate a 6-digit OTP (dev/test use only) */
export function generateOtp(): string {
  return Math.floor(100_000 + Math.random() * 900_000).toString()
}

/** Validate Luhn-adjacent Aadhaar check (length only — real check requires UIDAI) */
export function isValidAadhaar(aadhaar: string): boolean {
  return /^\d{12}$/.test(aadhaar.replace(/\s/g, ''))
}

/** Validate Indian IFSC code */
export function isValidIFSC(ifsc: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())
}
