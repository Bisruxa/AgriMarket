/** Dashboard home for each role (used for "Back" from standalone pages like /chat). */
export function getDashboardHref(role?: string | null): string {
  const r = role?.toUpperCase();
  if (r === 'FARMER') return '/farmer/dashboard';
  if (r === 'TRADER') return '/trader/dashboard';
  if (r === 'ADMIN') return '/admin/dashboard';
  return '/signin';
}
