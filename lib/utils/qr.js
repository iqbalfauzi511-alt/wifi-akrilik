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
      : 'https://cobascan.my.id';
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

/**
 * Generate high-res QR code PNG Data URL with code label neatly printed underneath
 * Matches Canva stand akrilik template spacing
 * @param {string} code e.g. "CS-4FZ9QK"
 * @param {string} url e.g. "https://cobascan.my.id/q/CS-4FZ9QK"
 * @param {object} options 
 * @returns {Promise<string>} data:image/png;base64,...
 */
export async function generateQrWithLabelDataUrl(code, url, options = {}) {
  const width = options.width || 1000;
  const qrDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 2,
    width: width,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
    ...options,
  });

  if (typeof window === 'undefined') return qrDataUrl;

  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const extraHeight = Math.round(width * 0.12); // ~12% extra height for label
      canvas.width = width;
      canvas.height = width + extraHeight;

      const ctx = canvas.getContext('2d');
      // Pure white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR image
      ctx.drawImage(img, 0, 0, width, width);

      // Label typography (bold, crisp, modern sans-serif like Canva design)
      const fontSize = Math.round(width * 0.046); // ~46px for 1000px QR
      ctx.fillStyle = '#0f172a';
      ctx.font = `800 ${fontSize}px Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Position: just below the QR with breathing room matching template
      const textY = width + Math.round(extraHeight * 0.42);
      ctx.fillText(code, width / 2, textY);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(qrDataUrl);
    img.src = qrDataUrl;
  });
}

/**
 * Generate high-res QR code SVG string with code label underneath
 * @param {string} code 
 * @param {string} url 
 * @param {object} options 
 * @returns {Promise<string>} <svg>...</svg>
 */
export async function generateQrWithLabelSvg(code, url, options = {}) {
  const rawSvg = await QRCode.toString(url, {
    errorCorrectionLevel: 'H',
    type: 'svg',
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
    ...options,
  });

  // Extract viewBox e.g. viewBox="0 0 37 37"
  const match = rawSvg.match(/viewBox="0 0 (\d+) (\d+)"/);
  if (!match) return rawSvg;

  const originalW = parseInt(match[1], 10);
  const originalH = parseInt(match[2], 10);
  const extraH = Number((originalH * 0.12).toFixed(2));
  const newH = Number((originalH + extraH).toFixed(2));
  const fontSize = (originalW * 0.046).toFixed(2);
  const textY = (originalH + extraH * 0.45).toFixed(2);

  let svg = rawSvg
    .replace(`viewBox="0 0 ${originalW} ${originalH}"`, `viewBox="0 0 ${originalW} ${newH}"`)
    .replace(new RegExp(`d="M0 0h${originalW}v${originalH}H0z"`, 'g'), `d="M0 0h${originalW}v${newH}H0z"`)
    .replace(/<rect\s+width="[^"]*"\s+height="[^"]*"\s+fill="#ffffff"\/>/, `<rect width="${originalW}" height="${newH}" fill="#ffffff"/>`);

  const textElement = `\n  <text x="${(originalW / 2).toFixed(1)}" y="${textY}" text-anchor="middle" dominant-baseline="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-weight="800" font-size="${fontSize}" fill="#0f172a">${code}</text>\n</svg>`;
  svg = svg.replace(/<\/svg>\s*$/, textElement);

  return svg;
}
