/** Account types that can sign in. Order drives the Login screen selector. */
export const USER_ROLES = ['customer', 'vendor', 'admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const DEFAULT_USER_ROLE: UserRole = 'customer';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Customer',
  vendor: 'Vendor',
  admin: 'Admin',
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);
}
