import crypto from 'crypto';

const CURRENT_ALGORITHM = 'pbkdf2';
const CURRENT_ITERATIONS = 210000;
const KEY_LEN = 64;
const DIGEST = 'sha512';

/**
 * Hash password/PIN securely using PBKDF2 with 210,000 iterations (OWASP standard)
 * Returns versioned format: "pbkdf2:210000:salt_hex:hash_hex"
 * @param {string} password
 * @returns {string}
 */
export function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, CURRENT_ITERATIONS, KEY_LEN, DIGEST)
    .toString('hex');
  return `${CURRENT_ALGORITHM}:${CURRENT_ITERATIONS}:${salt}:${hash}`;
}

/**
 * Checks whether a stored hash is using an older algorithm or lower iteration count
 * @param {string} storedHash
 * @returns {boolean}
 */
export function needsRehash(storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return true;
  if (!storedHash.startsWith('pbkdf2:')) return true;
  const parts = storedHash.split(':');
  if (parts.length !== 4) return true;
  const iterations = parseInt(parts[1], 10);
  return isNaN(iterations) || iterations < CURRENT_ITERATIONS;
}

/**
 * Verify password against stored hash with timing attack resistance.
 * Seamlessly supports both new versioned hashes (210k iterations) and legacy hashes (1k iterations).
 * @param {string} password
 * @param {string} storedHash
 * @returns {boolean}
 */
export function verifyPassword(password, storedHash) {
  if (!password || !storedHash || typeof storedHash !== 'string' || typeof password !== 'string') {
    return false;
  }

  try {
    const parts = storedHash.split(':');

    // 1. Versioned hash format: "pbkdf2:iterations:salt:hash"
    if (parts.length === 4 && parts[0] === 'pbkdf2') {
      const iterations = parseInt(parts[1], 10);
      const salt = parts[2];
      const originalHash = parts[3];

      if (isNaN(iterations) || iterations < 1000 || iterations > 2000000 || !salt || !originalHash) {
        return false;
      }

      const computedHash = crypto
        .pbkdf2Sync(password, salt, iterations, KEY_LEN, DIGEST)
        .toString('hex');

      const computedBuf = Buffer.from(computedHash, 'hex');
      const originalBuf = Buffer.from(originalHash, 'hex');

      if (computedBuf.length !== originalBuf.length) return false;
      return crypto.timingSafeEqual(computedBuf, originalBuf);
    }

    // 2. Legacy format: "salt:hash" (1,000 iterations)
    if (parts.length === 2) {
      const [salt, originalHash] = parts;
      if (!salt || !originalHash) return false;

      const computedHash = crypto
        .pbkdf2Sync(password, salt, 1000, KEY_LEN, DIGEST)
        .toString('hex');

      const computedBuf = Buffer.from(computedHash, 'hex');
      const originalBuf = Buffer.from(originalHash, 'hex');

      if (computedBuf.length !== originalBuf.length) return false;
      return crypto.timingSafeEqual(computedBuf, originalBuf);
    }

    return false;
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

