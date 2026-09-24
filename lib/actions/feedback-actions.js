'use server';

import { db, ensureDatabaseInitialized } from '@/lib/db';
import { customerFeedback, qrCodes, businesses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Submit Customer Feedback (Ratings 1-5, specifically 1-2 star feedback)
 */
export async function submitCustomerFeedbackAction({
  qrCode,
  rating,
  message,
  customerName = '',
  customerPhone = '',
}) {
  await ensureDatabaseInitialized();

  if (!qrCode) {
    return { success: false, error: 'Kode perangkat tidak valid.' };
  }

  const numRating = Number(rating);
  if (!numRating || numRating < 1 || numRating > 5) {
    return { success: false, error: 'Rating harus antara 1 sampai 5 bintang.' };
  }

  // Find QR and connected business
  const qr = await db.query.qrCodes.findFirst({
    where: eq(qrCodes.code, qrCode.trim().toUpperCase()),
    with: {
      business: true,
    },
  });

  if (!qr || !qr.businessId) {
    return { success: false, error: 'Perangkat atau bisnis tidak ditemukan.' };
  }

  const business = qr.business || await db.query.businesses.findFirst({
    where: eq(businesses.id, qr.businessId),
  });

  // Insert feedback record
  const [created] = await db.insert(customerFeedback).values({
    businessId: qr.businessId,
    qrId: qr.id,
    rating: numRating,
    message: (message || '').trim(),
    customerName: (customerName || '').trim() || null,
    customerPhone: (customerPhone || '').trim() || null,
  }).returning();

  // Generate WhatsApp message if business has WhatsApp number
  const rawWa = (business?.whatsappNumber || '').replace(/[^0-9]/g, '');
  let waUrl = null;

  if (rawWa) {
    let cleanWa = rawWa;
    if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.substring(1);
    } else if (!cleanWa.startsWith('62')) {
      cleanWa = '62' + cleanWa;
    }

    const businessName = business?.businessName || 'Cobascan';
    const starsEmoji = '★'.repeat(numRating);
    const feedbackText = (message || '').trim() || 'Pelanggan ingin menyampaikan masukan langsung.';
    const sender = (customerName || '').trim() ? ` dari ${customerName.trim()}` : '';

    const waText = `Halo ${businessName}, saya pelanggan${sender} dari meja (Kode: ${qr.code}).\n\nSaya memberikan rating: ${numRating} Bintang (${starsEmoji})\n\nMasukan/Keluhan:\n"${feedbackText}"\n\nMohon dapat ditindaklanjuti. Terima kasih.`;

    waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(waText)}`;
  }

  return {
    success: true,
    feedbackId: created.id,
    whatsappUrl: waUrl,
    whatsappNumber: business?.whatsappNumber || null,
  };
}
