// Validation utilities

/**
 * UUID v4 validation regex
 */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID v4
 * @param uuid - String to validate
 * @returns True if valid UUID v4, false otherwise
 */
export function isValidUuid(uuid: string): boolean {
  return UUID_V4_REGEX.test(uuid);
}
