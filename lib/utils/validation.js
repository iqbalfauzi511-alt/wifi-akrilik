/**
 * Input validation and sanitization utilities
 */

const INSTAGRAM_URL_ERROR =
  'Link Instagram tidak valid. Masukkan link Instagram bisnis Anda. Contoh: https://www.instagram.com/kopisenja/';

const GOOGLE_MAPS_REVIEW_URL_ERROR =
  'Link Review Google Maps tidak valid. Masukkan link Google Maps yang mengarahkan pelanggan ke halaman ulasan/rating. Contoh: https://maps.app.goo.gl/... atau https://maps.google.com/...';

/**
 * Validate and normalize Google Maps Review URL
 */
export function validateGoogleMapsUrl(input) {
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: 'Link Review Google Maps tidak boleh kosong' };
  }

  let trimmed = input.trim();

  // Auto-prepend https:// if missing
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    // Strict validation: Only accept official Google domains and subdomains
    // Accepts: maps.app.goo.gl, goo.gl, g.page, maps.google.com, search.google.com, google.co.id, g.co, etc.
    // Rejects: evil-maps.com, phishinggoogle.com, google.attacker.com, etc.
    const isGoogleShortlink = host === 'goo.gl' || host.endsWith('.goo.gl') || 
                              host === 'g.page' || host.endsWith('.g.page') ||
                              host === 'g.co' || host.endsWith('.g.co');
    const isGoogleSearchOrMaps = /^(?:[a-z0-9-]+\.)*google\.(?:com|co\.[a-z]{2}|com\.[a-z]{2}|[a-z]{2})$/i.test(host);

    if (!isGoogleShortlink && !isGoogleSearchOrMaps) {
      return { isValid: false, error: GOOGLE_MAPS_REVIEW_URL_ERROR };
    }

    return {
      isValid: true,
      normalized: trimmed,
    };
  } catch {
    return { isValid: false, error: GOOGLE_MAPS_REVIEW_URL_ERROR };
  }
}

/**
 * Validate Smart QR + NFC Business input (Google Maps + Optional Wi-Fi)
 */
export function validateSmartQrInput({
  businessName,
  logoUrl,
  googleMapsReviewUrl,
  googleMapsUrl,
  wifiEnabled,
  wifiName,
  wifiPassword,
}) {
  const errors = {};

  if (!businessName || businessName.trim().length < 2) {
    errors.businessName = 'Nama bisnis minimal 2 karakter';
  }

  const rawMapsUrl = googleMapsReviewUrl !== undefined ? googleMapsReviewUrl : googleMapsUrl;
  const mapsValidation = validateGoogleMapsUrl(rawMapsUrl);
  if (!mapsValidation.isValid) {
    errors.googleMapsReviewUrl = mapsValidation.error;
    errors.googleMapsUrl = mapsValidation.error;
  }

  let cleanLogoUrl = null;
  if (logoUrl && typeof logoUrl === 'string') {
    const trimmedLogo = logoUrl.trim();
    if (trimmedLogo.startsWith('data:image/') || /^https?:\/\//i.test(trimmedLogo)) {
      if (trimmedLogo.length <= 2500000) {
        cleanLogoUrl = trimmedLogo;
      } else {
        errors.logoUrl = 'Ukuran logo terlalu besar (maksimal 2MB)';
      }
    } else if (trimmedLogo.length > 0) {
      errors.logoUrl = 'Format logo tidak valid. Gunakan file gambar atau URL http/https.';
    }
  }

  const isWifiOn =
    wifiEnabled === true ||
    wifiEnabled === 'true' ||
    wifiEnabled === 'on' ||
    wifiEnabled === '1';

  if (isWifiOn) {
    if (!wifiName || wifiName.trim().length < 1) {
      errors.wifiName = 'Nama Wi-Fi (SSID) tidak boleh kosong jika fitur Wi-Fi aktif';
    }
    if (!wifiPassword || wifiPassword.trim().length < 4) {
      errors.wifiPassword = 'Password Wi-Fi minimal 4 karakter jika fitur Wi-Fi aktif';
    }
  }

  const normalizedMaps = mapsValidation.isValid ? mapsValidation.normalized : '';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      businessName: businessName ? businessName.trim() : '',
      logoUrl: cleanLogoUrl,
      googleMapsReviewUrl: normalizedMaps,
      googleMapsUrl: normalizedMaps,
      wifiEnabled: isWifiOn,
      wifiName: isWifiOn && wifiName ? wifiName.trim() : null,
      wifiPassword: isWifiOn && wifiPassword ? wifiPassword.trim() : null,
    },
  };
}

export function validateBusinessInput(data) {
  // If Smart QR data is passed (googleMapsReviewUrl, googleMapsUrl, wifiEnabled, or logoUrl)
  if (data?.googleMapsReviewUrl !== undefined || data?.googleMapsUrl !== undefined || data?.wifiEnabled !== undefined || data?.logoUrl !== undefined) {
    return validateSmartQrInput(data);
  }

  const { businessName, wifiName, wifiPassword } = data || {};
  const errors = {};

  if (!businessName || businessName.trim().length < 2) {
    errors.businessName = 'Nama bisnis minimal 2 karakter';
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
      wifiName: wifiName ? wifiName.trim() : '',
      wifiPassword: wifiPassword ? wifiPassword.trim() : '',
    },
  };
}
