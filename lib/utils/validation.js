/**
 * Input validation and sanitization utilities
 */

const INSTAGRAM_URL_ERROR =
  'Link Instagram tidak valid. Masukkan link Instagram bisnis Anda. Contoh: https://www.instagram.com/kopisenja/';

/**
 * Validate and normalize Instagram URL
 * Accepts:
 * - https://instagram.com/kopisenja
 * - https://www.instagram.com/kopisenja/
 * - http://instagram.com/kopisenja
 * - http://www.instagram.com/kopisenja/
 * Rejects:
 * - kopisenja, @kopisenja, instagram.com/kopisenja, https://facebook.com/..., https://tiktok.com/...
 */
export function validateInstagramUrl(input) {
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: INSTAGRAM_URL_ERROR };
  }

  const trimmed = input.trim();

  // Must start with http:// or https://
  if (!/^https?:\/\//i.test(trimmed)) {
    return { isValid: false, error: INSTAGRAM_URL_ERROR };
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    // Host must be instagram.com or www.instagram.com
    if (host !== 'instagram.com' && host !== 'www.instagram.com') {
      return { isValid: false, error: INSTAGRAM_URL_ERROR };
    }

    // Path must contain username (e.g. /kopisenja or /kopisenja/)
    const pathSegments = parsed.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0) {
      return { isValid: false, error: INSTAGRAM_URL_ERROR };
    }

    const username = pathSegments[0];
    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
      return { isValid: false, error: INSTAGRAM_URL_ERROR };
    }

    // Normalize protocol to https and format cleanly
    let normalized = `https://${host}/${username}/`;

    return {
      isValid: true,
      normalized,
      username,
    };
  } catch {
    return { isValid: false, error: INSTAGRAM_URL_ERROR };
  }
}

export function validateBusinessInput({ businessName, instagramUrl, wifiName, wifiPassword }) {
  const errors = {};

  if (!businessName || businessName.trim().length < 2) {
    errors.businessName = 'Nama bisnis minimal 2 karakter';
  }

  const igValidation = validateInstagramUrl(instagramUrl);
  if (!igValidation.isValid) {
    errors.instagramUrl = igValidation.error;
  }

  if (!wifiName || wifiName.trim().length < 1) {
    errors.wifiName = 'Nama Wi-Fi (SSID) tidak boleh kosong';
  }

  if (!wifiPassword || wifiPassword.trim().length < 4) {
    errors.wifiPassword = 'Password Wi-Fi minimal 4 karakter';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      businessName: businessName ? businessName.trim() : '',
      instagramUrl: igValidation.isValid ? igValidation.normalized : '',
      wifiName: wifiName ? wifiName.trim() : '',
      wifiPassword: wifiPassword ? wifiPassword.trim() : '',
    },
  };
}
