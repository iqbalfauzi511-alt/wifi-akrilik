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
  
  // 3. Try to parse CID from full maps URL
  // Matches ...!1s0x...:0xCIDHEX...
  const cidHexMatch = trimmed.match(/!1s(0x[a-f0-9]+):(0x[a-f0-9]+)/i);
  if (cidHexMatch) {
    try {
      const cidHex = cidHexMatch[2];
      const cid = BigInt(cidHex).toString();
      return `https://search.google.com/local/writereview?cid=${cid}`;
    } catch (e) {
      // Ignore BigInt conversion errors, fallback to original
    }
  }

  // If we can't parse it synchronously, return original
  // Note: Shortlinks like maps.app.goo.gl can't be reliably parsed synchronously
  return trimmed;
}
