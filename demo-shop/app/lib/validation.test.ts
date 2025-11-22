import { describe, it, expect } from 'vitest';
import { isValidUuid } from '~/lib/validation';

describe('isValidUuid', () => {
  it('returns true for valid UUID v4 (lowercase)', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(isValidUuid(uuid)).toBe(true);
  });

  it('returns true for valid UUID v4 (uppercase)', () => {
    const uuid = '550E8400-E29B-41D4-A716-446655440000';
    expect(isValidUuid(uuid)).toBe(true);
  });

  it('returns false for UUID with wrong version', () => {
    const uuidV1 = '550e8400-e29b-11d4-a716-446655440000';
    const uuidV5 = '550e8400-e29b-51d4-a716-446655440000';

    expect(isValidUuid(uuidV1)).toBe(false);
    expect(isValidUuid(uuidV5)).toBe(false);
  });

  it('returns false for UUID with invalid characters', () => {
    const invalidChars = '550e8400-e29b-41d4-a716-44665544zzzz';
    expect(isValidUuid(invalidChars)).toBe(false);
  });

  it('returns false for UUID with incorrect length', () => {
    const tooShort = '550e8400-e29b-41d4-a716-44665544';
    const tooLong = '550e8400-e29b-41d4-a716-4466554400001234';

    expect(isValidUuid(tooShort)).toBe(false);
    expect(isValidUuid(tooLong)).toBe(false);
  });
});

