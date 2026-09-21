import QRCode from 'qrcode';

/**
 * Get full public URL for a QR code
 * @param {string} code 
 * @returns {string} e.g. "https://domain.com/q/SW-X7K29A"
 */
export function getQrUrl(code) {
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl || baseUrl.includes('supabase.co')) {
    baseUrl = typeof window !== 'undefined' && window.location.origin 
      ? window.location.origin 
      : 'https://wifi-akrilik.vercel.app';
  }
  const cleanBase = baseUrl.replace(/\/$/, '');
  return `${cleanBase}/q/${code}`;
}

/**
 * Generate QR code as Data URL (PNG base64)
 * @param {string} url Target URL
 * @param {object} options QR options
 * @returns {Promise<string>} data:image/png;base64,...
 */
export async function generateQrDataUrl(url, options = {}) {
  const defaultOptions = {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    quality: 0.95,
    margin: 2,
    width: 600,
    color: {
      dark: '#1e293b', // slate-800
      light: '#ffffff',
    },
    ...options,
  };

  return await QRCode.toDataURL(url, defaultOptions);
}

/**
 * Generate QR code as SVG string
 * @param {string} url 
 * @param {object} options 
 * @returns {Promise<string>} <svg>...</svg>
 */
export async function generateQrSvg(url, options = {}) {
  const defaultOptions = {
    errorCorrectionLevel: 'H',
    type: 'svg',
    margin: 2,
    width: 600,
    color: {
      dark: '#1e293b',
      light: '#ffffff',
    },
    ...options,
  };

  return await QRCode.toString(url, defaultOptions);
}
