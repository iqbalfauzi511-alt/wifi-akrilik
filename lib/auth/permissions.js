/**
 * Authorization helper functions
 */

export function isAdmin(role) {
  return role === 'admin';
}

export function isCustomer(role) {
  return role === 'customer';
}

export function canManageBusiness(session, businessId) {
  if (!session || !session.user) return false;
  if (session.role === 'admin') return true;
  return session.business && session.business.id === businessId;
}
