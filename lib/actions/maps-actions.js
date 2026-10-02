'use server';

import { constructPlaceId } from '@/lib/utils/maps';

/**
 * Detect if a URL is already a review/write-review URL
 */
function isAlreadyReviewUrl(url) {
  return (
    url.includes('search.google.com/local/writereview') ||
    url.includes('/review') ||
    url.includes('maps.google.com/local/writereview')
  );
}

/**
 * Check if URL is a valid Google Maps / Google domain URL
 */
function isValidGoogleUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const isShortlink =
      host === 'goo.gl' || host.endsWith('.goo.gl') ||
      host === 'g.page' || host.endsWith('.g.page') ||
      host === 'g.co' || host.endsWith('.g.co');
    const isGoogleDomain = /^(?:[a-z0-9-]+\.)*google\.(?:com|co\.[a-z]{2}|com\.[a-z]{2}|[a-z]{2})$/i.test(host);
    return isShortlink || isGoogleDomain;
  } catch {
    return false;
  }
}

/**
 * Try to extract a review URL from a full Google Maps URL
 * by looking for !1s hex patterns in the URL itself.
 */
function tryExtractReviewUrl(url) {
  // Pattern 1: g.page/r/... link
  const gPageMatch = url.match(/g\.page\/r\/([a-zA-Z0-9_-]+)/i);
  if (gPageMatch) {
    return `https://g.page/r/${gPageMatch[1]}/review`;
  }

  // Pattern 2: Extract hex from !1s0x...:0x... in the URL
  const hexMatch = url.match(/!1s(0x[a-f0-9]+):(0x[a-f0-9]+)/i);
  if (hexMatch) {
    try {
      const placeId = constructPlaceId(hexMatch[1], hexMatch[2]);
      return `https://search.google.com/local/writereview?placeid=${placeId}`;
    } catch {
      // Fall through
    }
  }

  // Pattern 3: CID-based URL -> convert to review via search.google.com
  const cidMatch = url.match(/[?&]cid=(\d+)/i);
  if (cidMatch) {
    return `https://search.google.com/local/writereview?placeid=${cidMatch[1]}`;
  }

  return null;
}

/**
 * Generate Google Review Link from any Google Maps URL.
 *
 * Strategy:
 * 1. If already a review URL, return it as-is.
 * 2. Try to extract review URL from the URL string directly (hex, g.page, CID).
 * 3. For shortlinks (goo.gl, maps.app.goo.gl), follow redirects and try again.
 * 4. For full maps.google.com URLs without extractable hex, return the URL as-is
 *    (it's a valid Maps URL and will still open Google Maps for the correct place).
 */
export async function generateReviewLinkAction(url) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return { success: false, error: 'Link Google Maps tidak boleh kosong.' };
  }

  const rawUrl = url.trim();

  // Validate it's a Google URL first
  if (!isValidGoogleUrl(rawUrl)) {
    return {
      success: false,
      error: 'URL tidak valid. Masukkan link Google Maps dari tombol "Bagikan" di Google Maps atau Google Bisnisku.',
    };
  }

  // Already a review URL — nothing to do
  if (isAlreadyReviewUrl(rawUrl)) {
    return { success: true, result: rawUrl };
  }

  // Try to extract a review URL directly from the raw URL string
  const directResult = tryExtractReviewUrl(rawUrl);
  if (directResult) {
    return { success: true, result: directResult };
  }

  // For shortlinks, follow the redirect and try again
  const isShortlink =
    rawUrl.includes('goo.gl') ||
    rawUrl.includes('maps.app.goo.gl') ||
    rawUrl.includes('g.page') ||
    rawUrl.includes('g.co/');

  if (isShortlink) {
    try {
      const res = await fetch(rawUrl, {
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(8000),
      });

      const finalUrl = res.url;

      // Try to extract from the resolved URL
      const fromFinalUrl = tryExtractReviewUrl(finalUrl);
      if (fromFinalUrl) {
        return { success: true, result: fromFinalUrl };
      }

      // Try to extract from the HTML body
      try {
        const html = await res.text();
        const fromHtml = tryExtractReviewUrl(html);
        if (fromHtml) {
          return { success: true, result: fromHtml };
        }
      } catch {
        // body read failed, ignore
      }

      // If redirect resolved to a valid maps page but we couldn't extract a review link,
      // use the resolved URL directly — it's still a valid Google Maps link.
      if (isValidGoogleUrl(finalUrl)) {
        return { success: true, result: finalUrl, note: 'direct' };
      }
    } catch (e) {
      console.error('Shortlink resolve failed:', e?.message || e);
      // Fall through to return the original URL
    }
  }

  // Fallback: the URL is a valid Google Maps URL but we couldn't convert it
  // to a direct write-review link. Return it as-is so it at least opens the place.
  // This is better than showing an error — the user can still tap the review button
  // once they land on the Maps page.
  return {
    success: true,
    result: rawUrl,
    note: 'fallback',
  };
}
