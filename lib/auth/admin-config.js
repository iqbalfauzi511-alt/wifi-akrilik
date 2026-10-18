export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [])
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const ADMIN_WA = (process.env.ADMIN_WA || '').trim();

if (process.env.NODE_ENV === 'production' && ADMIN_EMAILS.length === 0 && !ADMIN_WA) {
  console.error('[SECURITY CRITICAL] No ADMIN_EMAILS or ADMIN_WA configured in production environment.');
}

export function isUserAdmin(email) {
  if (!email || ADMIN_EMAILS.length === 0) return false;
  const cleanEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(cleanEmail);
}

export function isUserAdminWa(wa) {
  if (!wa || !ADMIN_WA) return false;
  return wa.trim() === ADMIN_WA;
}
