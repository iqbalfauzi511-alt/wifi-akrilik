'use server';

import { createRating } from '@/lib/db/queries/ratings';
import { getPublicQrByCode } from '@/lib/db/queries/qr';
import { normalizeWhatsAppNumber } from '@/lib/utils/phone';

export async function submitRatingAction(formData) {
  try {
    const qrCodeValue = formData.get('code');
    const rating = parseInt(formData.get('rating') || '0', 10);
    const feedback = formData.get('feedback') || '';

    if (!qrCodeValue || rating < 1 || rating > 5) {
      return { success: false, error: 'Data rating tidak valid.' };
    }

    // Get the QR code and business details
    const qr = await getPublicQrByCode(qrCodeValue);
    if (!qr || !qr.businessId) {
      return { success: false, error: 'Bisnis tidak ditemukan.' };
    }

    // Save to database
    await createRating({
      businessId: qr.businessId,
      qrId: qr.id,
      rating,
      feedback,
    });

    // If rating is 1 or 2, we return the WhatsApp URL for the frontend to open
    if (rating <= 2) {
      const waNumber = qr.whatsappNumber ? normalizeWhatsAppNumber(qr.whatsappNumber) : null;
      if (waNumber) {
        const message = `Halo ${qr.businessName}, saya ingin memberikan feedback melalui Cobascan.\n\nRating: ${'⭐'.repeat(rating)} (${rating}/5)\n\nFeedback:\n${feedback}\n\nTerima kasih.`;
        const encodedMessage = encodeURIComponent(message);
        const waUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;
        
        return { success: true, redirectUrl: waUrl };
      }
      // If no WA number configured, we just return success
      return { success: true };
    }

    // For rating 3-5, no redirect URL (handled by frontend to show Google Maps)
    return { success: true };

  } catch (error) {
    console.error('Submit rating error:', error);
    return { success: false, error: 'Terjadi kesalahan sistem.' };
  }
}
