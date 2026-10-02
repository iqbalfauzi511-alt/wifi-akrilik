/**
 * Constructs a Google Place ID from the two hex strings found in a Google Maps URL.
 * Maps URL format: ...!1s0xHEX1:0xHEX2...
 */
export function constructPlaceId(hex1, hex2) {
  let h1 = hex1.replace('0x', '').padStart(16, '0');
  let h2 = hex2.replace('0x', '').padStart(16, '0');

  // Convert hex to byte array and reverse for little endian
  const buf1 = Buffer.from(h1, 'hex').reverse();
  const buf2 = Buffer.from(h2, 'hex').reverse();

  // Protobuf structure: [0x0A, 0x12, 0x09] + buf1 + [0x11] + buf2
  const protobuf = Buffer.concat([
    Buffer.from([0x0A, 0x12, 0x09]),
    buf1,
    Buffer.from([0x11]),
    buf2
  ]);

  // Base64 encode and make URL safe
  let base64 = protobuf.toString('base64');
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
  const hexMatch = trimmed.match(/!1s(0x[a-f0-9]+):(0x[a-f0-9]+)/i);
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
