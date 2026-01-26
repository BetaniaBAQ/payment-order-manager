/**
 * Generate a URL-friendly slug from a string.
 *
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters
 * - Handles accents (Unicode normalization)
 * - Limits maximum length
 */
export function generateSlug(input: string, maxLength = 50): string {
  return (
    input
      // Normalize Unicode (decompose accents)
      .normalize('NFD')
      // Remove accent marks
      .replace(/[\u0300-\u036f]/g, '')
      // Convert to lowercase
      .toLowerCase()
      // Replace spaces and underscores with hyphens
      .replace(/[\s_]+/g, '-')
      // Remove non-alphanumeric characters except hyphens
      .replace(/[^a-z0-9-]/g, '')
      // Replace multiple hyphens with single hyphen
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-|-$/g, '')
      // Limit length
      .slice(0, maxLength)
  )
}

/**
 * Generate a unique slug by appending a numeric suffix if needed.
 *
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export function makeSlugUnique(
  baseSlug: string,
  existingSlugs: Array<string>,
): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug
  }

  let counter = 1
  let uniqueSlug = `${baseSlug}-${counter}`

  while (existingSlugs.includes(uniqueSlug)) {
    counter++
    uniqueSlug = `${baseSlug}-${counter}`
  }

  return uniqueSlug
}
