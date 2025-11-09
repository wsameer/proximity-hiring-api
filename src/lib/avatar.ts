/**
 * Avatar generation utilities
 * Generates avatar URLs from user names
 */

/**
 * Generate avatar URL using UI Avatars API
 * https://ui-avatars.com/
 */
export function generateAvatarUrl(name: string): string {
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&size=256&background=random&bold=true`;
}

/**
 * Extract initials from name
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
