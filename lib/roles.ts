export type AppRole = 'owner' | 'admin' | 'member'

export function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? ''
}

export function getConfiguredOwnerEmail() {
  return normalizeEmail(process.env.OWNER_EMAIL || process.env.ADMIN_EMAIL) || null
}

export function isConfiguredOwnerEmail(email?: string | null) {
  const ownerEmail = getConfiguredOwnerEmail()
  return !!ownerEmail && normalizeEmail(email) === ownerEmail
}

export function isOwnerRole(role?: string | null) {
  return role === 'owner'
}

export function isAdminRole(role?: string | null) {
  return role === 'admin' || role === 'owner'
}

export function canManageTargetRole(actorRole?: string | null, targetRole?: string | null) {
  if (!isAdminRole(actorRole)) return false
  if (actorRole === 'owner') return true
  return targetRole !== 'owner' && targetRole !== 'admin'
}
