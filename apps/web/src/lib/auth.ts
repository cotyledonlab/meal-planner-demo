/**
 * Auth utility functions for checking user permissions and roles
 */

interface UserWithRole {
  role?: string | null;
}

/**
 * Check if a user has premium access
 */
export function isPremiumUser(user: UserWithRole | null | undefined): boolean {
  return user?.role === 'premium';
}

/**
 * Check if a user has at least basic access (logged in)
 */
export function isAuthenticatedUser(user: UserWithRole | null | undefined): boolean {
  return !!user;
}
