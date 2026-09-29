'use server';

import { autoConvertMapsUrl, constructPlaceId } from '@/lib/utils/maps';
import { validateGoogleMapsUrl } from '@/lib/utils/validation';

/**
 * Generate Google Review Link from a normal Google Maps URL
 */
export async function generateReviewLinkAction(url) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return { success: false, error: 'Link Google Maps tidak boleh kosong.' };
  }

  const rawUrl = url.trim();
  let convertedUrl = autoConvertMapsUrl(rawUrl);

  // If autoConvert returned the original shortlink, let's try to resolve it via fetch
  if (convertedUrl.includes('goo.gl') || convertedUrl.includes('maps.app.goo.gl')) {
    try {
      const res = await fetch(convertedUrl, { 
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const finalUrl = res.url;
      // If the final URL is a g.page link, convert it
      const gPageMatch = finalUrl.match(/g\.page\/r\/([a-zA-Z0-9_-]+)/i);
      if (gPageMatch) {
        convertedUrl = `https://g.page/r/${gPageMatch[1]}/review`;
      } else {
        // Look for the !1s0x...:0x... pattern in the URL or HTML to construct Place ID
        const hexMatch = finalUrl.match(/!1s(0x[a-f0-9]+):(0x[a-f0-9]+)/i) || 
                         (await res.text()).match(/!1s(0x[a-f0-9]+):(0x[a-f0-9]+)/i);
                         
        if (hexMatch) {
          const placeId = constructPlaceId(hexMatch[1], hexMatch[2]);
          convertedUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;
        }
      }
    } catch (e) {
      console.error('Failed to resolve shortlink:', e);
    }
  }

  // After conversion attempt, if it's not a proper review link, return error
  if (!convertedUrl.includes('search.google.com/local/writereview') && !convertedUrl.includes('/review')) {
     return { success: false, error: 'Gagal menghasilkan link review. Harap gunakan fitur "Minta Ulasan" dari aplikasi Google Bisnisku Anda.' };
  }

  // Final validation to be safe
  const validation = validateGoogleMapsUrl(convertedUrl);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  // To be strict, if the user explicitly wants a *Review* link, 
  // it should ideally be search.google.com or g.page/.../review. 
  // But validateGoogleMapsUrl currently accepts maps.app.goo.gl too.
  // The prompt says: "Jika berhasil: tampilkan hasil Review Link. Jika gagal: tampilkan pesan error; jangan menyimpan hasil yang tidak valid."

  return { success: true, result: convertedUrl };
}
