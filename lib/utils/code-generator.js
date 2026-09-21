import crypto from 'crypto';

// Character set avoiding ambiguous characters (0 vs O, 1 vs I)
const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generate a single unique random QR code
 * Format: SW-XXXXXX (e.g. SW-X7K29A, SW-P8L42B)
 */
export function generateQrCode() {
  const bytes = crypto.randomBytes(6);
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += CHARSET[bytes[i] % CHARSET.length];
  }
  return `SW-${result}`;
}

/**
 * Generate an array of unique random QR codes
 * @param {number} count Number of codes to generate
 * @param {Set<string>} existingCodes Set of existing codes to avoid duplicates
 */
export function generateBatchQrCodes(count, existingCodes = new Set()) {
  const generated = new Set();
  while (generated.size < count) {
    const code = generateQrCode();
    if (!existingCodes.has(code) && !generated.has(code)) {
      generated.add(code);
    }
  }
  return Array.from(generated);
}

/**
 * Generate a unique batch code
 * Format: BATCH-001, BATCH-002, or BATCH-XXX
 * @param {number|string} [sequence] Optional sequence number
 */
export function generateBatchCode(sequence) {
  if (sequence !== undefined && sequence !== null && !isNaN(Number(sequence))) {
    return `BATCH-${String(sequence).padStart(3, '0')}`;
  }
  const bytes = crypto.randomBytes(3);
  let rand = '';
  for (let i = 0; i < 3; i++) {
    rand += CHARSET[bytes[i] % CHARSET.length];
  }
  return `BATCH-${rand}`;
}
