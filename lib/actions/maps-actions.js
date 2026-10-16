'use server';

import { constructPlaceId } from '@/lib/utils/maps';

/**
 * Clean, extract and normalize Google URLs from raw user input.
 * Handles:
 * - Bare Place ID strings (ChIJ...)
 * - Copy-pasted text with embedded URLs ("Kopi Senja https://maps.app.goo.gl/...")
 * - URLs missing http:// or https://
 * - Trailing punctuation from text selections
 */
function extractAndNormalizeGoogleUrl(input) {
  if (!input || typeof input !== 'string') return '';
  let str = input.trim();

  // 1. Bare Google Place ID (e.g. ChIJN1t_tDeuEmsRUsoyG83frY4)
  if (/^ChIJ[a-zA-Z0-9_-]{20,}$/.test(str)) {
    return `https://search.google.com/local/writereview?placeid=${str}`;
  }

  // 2. Extract embedded URL if present
  const urlMatch = str.match(/https?:\/\/[^\s]+/i);
  if (urlMatch) {
    str = urlMatch[0];
  }

  // 3. Clean trailing punctuation from copy-paste (.,;)
  str = str.replace(/[.,;!]+$/, '');

  // 4. Prepend protocol if missing
  if (!/^https?:\/\//i.test(str)) {
    if (/^(?:maps\.app\.goo\.gl|goo\.gl|g\.page|g\.co|(?:[a-z0-9-]+\.)*google\.[a-z.]+)/i.test(str)) {
      str = `https://${str}`;
    }
  }

  return str;
}

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
 */
function tryExtractReviewUrl(url) {
  if (!url || typeof url !== 'string') return null;

  // Already a review URL
  if (isAlreadyReviewUrl(url)) {
    return url;
  }

  // Handle consent.google.com?continue=... or redirect URLs
  if (url.includes('continue=')) {
    try {
      const parsed = new URL(url);
      const continueParam = parsed.searchParams.get('continue');
      if (continueParam) {
        const fromContinue = tryExtractReviewUrl(decodeURIComponent(continueParam));
        if (fromContinue) return fromContinue;
      }
    } catch {
      // ignore
    }
  }

  // Pattern 1: g.page/r/... link
  const gPageMatch = url.match(/g\.page\/r\/([a-zA-Z0-9_-]+)/i);
  if (gPageMatch) {
    return `https://g.page/r/${gPageMatch[1]}/review`;
  }

  // Pattern 2: Extract hex from !1s0x...:0x... or ftid=0x...:0x... in the URL
  const hexMatch = url.match(/(?:!1s|ftid=)(0x[a-f0-9]+):(0x[a-f0-9]+)/i);
  if (hexMatch) {
    try {
      const placeId = constructPlaceId(hexMatch[1], hexMatch[2]);
      return `https://search.google.com/local/writereview?placeid=${placeId}`;
    } catch {
      // Fall through
    }
  }

  // Pattern 3: explicit place_id / placeid / query_place_id
  const placeIdMatch = url.match(/[?&](?:place_id|placeid|query_place_id)=(ChIJ[a-zA-Z0-9_-]+)/i);
  if (placeIdMatch) {
    return `https://search.google.com/local/writereview?placeid=${placeIdMatch[1]}`;
  }

  // Pattern 4: CID or ludocid based URL
  const cidMatch = url.match(/[?&](?:cid|ludocid)=(\d+)/i);
  if (cidMatch) {
    return `https://search.google.com/local/writereview?placeid=${cidMatch[1]}`;
  }

  return null;
}

/**
 * Generate Google Review Link from any Google Maps URL.
 */
export async function generateReviewLinkAction(url) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return { success: false, error: 'Link Google Maps tidak boleh kosong.' };
  }

  const rawUrl = extractAndNormalizeGoogleUrl(url);

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

  // For shortlinks, resolve redirects via manual redirect inspection (fast & resilient)
  const isShortlink =
    rawUrl.includes('goo.gl') ||
    rawUrl.includes('maps.app.goo.gl') ||
    rawUrl.includes('g.page') ||
    rawUrl.includes('g.co/');

  if (isShortlink) {
    try {
      let currentUrl = rawUrl;
      let hops = 0;
      const maxHops = 4;

      while (hops < maxHops) {
        hops++;
        const res = await fetch(currentUrl, {
          redirect: 'manual',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(4000),
        });

        const location = res.headers.get('location');
        if (!location) {
          // If no redirect header and 200, attempt extracting from body text
          if (res.status === 200) {
            try {
              const html = await res.text();
              const fromHtml = tryExtractReviewUrl(html);
              if (fromHtml) return { success: true, result: fromHtml };
            } catch {
              // ignore
            }
          }
          break;
        }

        const nextUrl = new URL(location, currentUrl).toString();
        const fromNext = tryExtractReviewUrl(nextUrl);
        if (fromNext) {
          return { success: true, result: fromNext };
        }

        currentUrl = nextUrl;
      }

      if (isValidGoogleUrl(currentUrl)) {
        const fromFinal = tryExtractReviewUrl(currentUrl);
        if (fromFinal) {
          return { success: true, result: fromFinal };
        }
        return { success: true, result: currentUrl, note: 'direct' };
      }
    } catch (e) {
      console.warn('Shortlink resolve warning:', e?.message || e);
    }
  }

  // Fallback: return normalized URL so user flow is never completely blocked
  return {
    success: true,
    result: rawUrl,
    note: 'fallback',
  };
}
