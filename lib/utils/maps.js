/**
 * Constructs a Google Place ID from the two hex strings found in a Google Maps URL.
 * Maps URL format: ...!1s0xHEX1:0xHEX2...
 */
/**
 * Constructs a Google Place ID from the two hex strings found in a Google Maps URL.
 * Maps URL format: ...!1s0xHEX1:0xHEX2...
 * Isomorphic: works reliably in both Node.js server environments and client browser runtimes.
 */
export function constructPlaceId(hex1, hex2) {
  const h1 = hex1.replace(/^0x/i, '').padStart(16, '0');
  const h2 = hex2.replace(/^0x/i, '').padStart(16, '0');

  // Convert hex to byte array and reverse for little endian
  const b1 = [];
  for (let i = 7; i >= 0; i--) {
    b1.push(parseInt(h1.substr(i * 2, 2), 16));
  }
  const b2 = [];
  for (let i = 7; i >= 0; i--) {
    b2.push(parseInt(h2.substr(i * 2, 2), 16));
  }

  // Protobuf structure: [0x0A, 0x12, 0x09] + b1 + [0x11] + b2
  const bytes = [0x0a, 0x12, 0x09, ...b1, 0x11, ...b2];

  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  const base64 =
    typeof Buffer !== 'undefined'
      ? Buffer.from(binary, 'binary').toString('base64')
      : btoa(binary);

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Auto-converts a normal Google Maps URL into a Review URL if possible.
 */
export function autoConvertMapsUrl(url) {
  if (!url || typeof url !== 'string') return url;
  
  const trimmed = url.trim();

  // 1. If it's already a review URL, do nothing
  if (trimmed.includes('search.google.com/local/writereview') || trimmed.endsWith('/review')) {
    return trimmed;
  }
  
  // 2. If it's a g.page link without /review, append it
  const gPageMatch = trimmed.match(/g\.page\/r\/([a-zA-Z0-9_-]+)/i);
  if (gPageMatch) {
    return `https://g.page/r/${gPageMatch[1]}/review`;
  }
  
  // 3. Try to extract Hex from full maps URL to construct Place ID
  const hexMatch = trimmed.match(/(?:!1s|ftid=)(0x[a-f0-9]+):(0x[a-f0-9]+)/i);
  if (hexMatch) {
    try {
      const placeId = constructPlaceId(hexMatch[1], hexMatch[2]);
      return `https://search.google.com/local/writereview?placeid=${placeId}`;
    } catch (e) {
      // Ignore conversion errors, fallback to original
    }
  }

  // 4. Try to extract CID
  const cidMatch = trimmed.match(/[?&]cid=(\d+)/i);
  if (cidMatch) {
    return `https://search.google.com/local/writereview?placeid=${cidMatch[1]}`;
  }

  // Return the original URL if we can't reliably convert it
  return trimmed;
}
