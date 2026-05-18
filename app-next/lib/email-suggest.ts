/**
 * Suggests a likely-correct email when the user mistypes a common domain.
 *
 *   suggestEmailFix("ali@gamil.com")     → "ali@gmail.com"
 *   suggestEmailFix("user@yaoho.com")    → "user@yahoo.com"
 *   suggestEmailFix("nour@hotmial.com")  → "nour@hotmail.com"
 *   suggestEmailFix("me@mycompany.com")  → null (not close to any known domain)
 *   suggestEmailFix("ali@gmail.com")     → null (already correct)
 *
 * Implementation: Levenshtein distance against a short list of high-volume
 * domains. If the typed domain is within 2 edits of a known one (and not
 * identical), we return the corrected email; otherwise null.
 *
 * Pure, dependency-free, ~1µs per call. Safe to run on every keystroke.
 */

const COMMON_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "live.com",
  "aol.com",
  "msn.com",
  "protonmail.com",
  "me.com",
];

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // Single-row dynamic programming — O(m·n) time, O(min(m,n)) space.
  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,        // deletion
        curr[j - 1] + 1,    // insertion
        prev[j - 1] + cost  // substitution
      );
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

/**
 * Demo list of "already registered" emails. In production this list
 * lives on the auth server — we hit `POST /auth/check-email` and read
 * back `{ exists: true }`. For now this static array lets QA test the
 * "حساب موجود مسبقاً" path without a backend.
 *
 * To test: enter any of these on the signup screen.
 */
const REGISTERED_EMAILS = new Set([
  "test@gmail.com",
  "demo@acadimiat.com",
  "admin@gmail.com",
  "user@acadimiat.com",
  "najlaaouda.88@gmail.com",
]);

/** Returns true when the email already has an account on file. */
export function isEmailRegistered(email: string): boolean {
  return REGISTERED_EMAILS.has(email.trim().toLowerCase());
}

/**
 * Demo list of phone numbers already on file. Each entry is the E.164
 * representation `dialCode+nationalNumber` (no spaces). The auth-server
 * equivalent is `POST /auth/check-phone`.
 */
const REGISTERED_PHONES = new Set([
  "+966500000000",
  "+966555555555",
  "+201001234567",
  "+971501234567",
]);

/**
 * Returns true when the phone number (dial-code + national digits, no
 * separators) already has an account. Strips all non-digit chars from
 * both sides before comparing.
 */
export function isPhoneRegistered(dial: string, national: string): boolean {
  const normalize = (s: string) => `+${s.replace(/\D/g, "")}`;
  const candidate = normalize(dial) + national.replace(/\D/g, "");
  for (const stored of REGISTERED_PHONES) {
    if (normalize(stored) === candidate) return true;
  }
  return false;
}

export function suggestEmailFix(email: string): string | null {
  const trimmed = email.trim();
  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex < 1 || atIndex === trimmed.length - 1) return null;

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1).toLowerCase();

  // Already a known domain → no suggestion needed.
  if (COMMON_DOMAINS.includes(domain)) return null;

  // Find the closest known domain.
  let bestMatch: string | null = null;
  let bestDistance = Infinity;
  for (const known of COMMON_DOMAINS) {
    const d = levenshtein(domain, known);
    if (d < bestDistance) {
      bestDistance = d;
      bestMatch = known;
    }
  }

  // Suggest only when "close but not identical" — distance 1 or 2.
  // 0 wouldn't reach here (covered above); >2 would yield false positives
  // (e.g. user@company.com getting "corrected" to user@gmail.com).
  if (bestMatch && bestDistance >= 1 && bestDistance <= 2) {
    return `${local}@${bestMatch}`;
  }
  return null;
}
