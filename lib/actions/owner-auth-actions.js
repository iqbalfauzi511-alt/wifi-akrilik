'use server';

import { cookies } from 'next/headers';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { users, businesses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { signSessionPayload } from '@/lib/auth/token';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { getCurrentSession } from '@/lib/auth/session';

// Normalize WA: "08123..." → "628123..."
function normalizeWa(raw) {
  if (!raw) return '';
  let num = raw.replace(/[^0-9]/g, '').trim();
  if (num.startsWith('0')) num = '62' + num.slice(1);
  else if (!num.startsWith('62')) num = '62' + num;
  return num;
}

/**
 * Owner Login menggunakan Nomor WhatsApp + PIN
 */
export async function ownerLoginAction({ whatsapp, pin }) {
  await ensureDatabaseInitialized();

  const wa = normalizeWa(whatsapp);
  if (!wa || wa.length < 10) {
    return { success: false, error: 'Nomor WhatsApp tidak valid.' };
  }
  if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    return { success: false, error: 'PIN harus terdiri dari 6 angka.' };
  }

  const owner = await db.query.users.findFirst({
    where: eq(users.whatsappNumber, wa),
  });

  if (!owner) {
    return { success: false, error: 'Nomor WhatsApp tidak terdaftar. Silakan aktivasi perangkat Cobascan Anda terlebih dahulu.' };
  }

  if (!owner.pinHash) {
    return { success: false, error: 'Akun belum memiliki PIN. Silakan hubungi Admin.' };
  }

  const isValid = verifyPassword(pin, owner.pinHash);
  if (!isValid) {
    return { success: false, error: 'PIN salah. Coba lagi atau hubungi Admin jika lupa PIN.' };
  }

  // Buat session cookie
  const sessionPayload = signSessionPayload({
    id: owner.id,
    email: owner.email || `${wa}@owner.cobascan.local`,
    name: owner.name || wa,
    role: 'customer',
    whatsapp: wa,
  });

  const cookieStore = await cookies();
  cookieStore.set('smartwifi_session', sessionPayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 hari
    path: '/',
  });

  return { success: true, redirectTo: '/dashboard' };
}

/**
 * Registrasi Owner baru via Aktivasi QR (WA + PIN)
 * Dipanggil dari ActivationForm saat WA belum terdaftar
 */
export async function ownerRegisterAction({ whatsapp, pin, name }) {
  await ensureDatabaseInitialized();

  const wa = normalizeWa(whatsapp);
  if (!wa || wa.length < 10) {
    return { success: false, error: 'Nomor WhatsApp tidak valid.' };
  }
  if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    return { success: false, error: 'PIN harus 6 angka.' };
  }

  // Cek apakah WA sudah terdaftar
  const existing = await db.query.users.findFirst({
    where: eq(users.whatsappNumber, wa),
  });

  if (existing) {
    return {
      success: false,
      error: 'Nomor WhatsApp ini sudah terdaftar.',
      waAlreadyRegistered: true,
      existingUser: { id: existing.id, name: existing.name },
    };
  }

  const pinHash = hashPassword(pin);
  const cleanName = (name || '').trim() || `Owner ${wa.slice(-4)}`;

  const [newOwner] = await db.insert(users).values({
    name: cleanName,
    role: 'customer',
    whatsappNumber: wa,
    pinHash: pinHash,
    emailVerified: true, // tidak butuh verifikasi email
  }).returning();

  // Buat session langsung
  const sessionPayload = signSessionPayload({
    id: newOwner.id,
    email: `${wa}@owner.cobascan.local`,
    name: cleanName,
    role: 'customer',
    whatsapp: wa,
  });

  const cookieStore = await cookies();
  cookieStore.set('smartwifi_session', sessionPayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return { success: true, userId: newOwner.id, name: cleanName };
}

/**
 * Cek apakah WA sudah terdaftar (untuk validasi real-time di form aktivasi)
 */
export async function checkWaRegisteredAction(whatsapp) {
  await ensureDatabaseInitialized();
  const wa = normalizeWa(whatsapp);
  if (!wa || wa.length < 10) return { registered: false };

  const existing = await db.query.users.findFirst({
    where: eq(users.whatsappNumber, wa),
  });

  return { registered: !!existing, userId: existing?.id };
}

/**
 * Ganti PIN Owner (harus login & tahu PIN lama)
 */
export async function ownerChangePinAction({ userId, oldPin, newPin }) {
  await ensureDatabaseInitialized();

  // Auto-resolve userId from session
  if (!userId) {
    const session = await getCurrentSession();
    userId = session?.user?.id;
  }

  if (!userId) return { success: false, error: 'Sesi tidak valid. Silakan login ulang.' };
  if (!oldPin || oldPin.length !== 6) return { success: false, error: 'PIN lama harus 6 angka.' };
  if (!newPin || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
    return { success: false, error: 'PIN baru harus 6 angka.' };
  }
  if (oldPin === newPin) return { success: false, error: 'PIN baru tidak boleh sama dengan PIN lama.' };

  const owner = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!owner || !owner.pinHash) {
    return { success: false, error: 'Akun tidak ditemukan.' };
  }

  const isValid = verifyPassword(oldPin, owner.pinHash);
  if (!isValid) {
    return { success: false, error: 'PIN lama salah.' };
  }

  const newPinHash = hashPassword(newPin);
  await db.update(users).set({ pinHash: newPinHash, updatedAt: new Date() }).where(eq(users.id, userId));

  return { success: true, message: 'PIN berhasil diubah.' };
}

/**
 * Reset PIN Owner oleh Admin (set ke PIN default sementara)
 */
export async function adminResetOwnerPinAction({ targetUserId, newPin = '123456' }) {
  await ensureDatabaseInitialized();

  if (!targetUserId) return { success: false, error: 'User ID tidak valid.' };
  if (!/^\d{6}$/.test(newPin)) return { success: false, error: 'PIN harus 6 angka.' };

  const owner = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
  });

  if (!owner) return { success: false, error: 'User tidak ditemukan.' };
  if (owner.role === 'admin') return { success: false, error: 'Tidak bisa reset PIN Admin.' };

  const pinHash = hashPassword(newPin);
  await db.update(users).set({ pinHash, updatedAt: new Date() }).where(eq(users.id, targetUserId));

  return { success: true, temporaryPin: newPin, message: `PIN direset ke ${newPin}. Berikan ke owner via WhatsApp.` };
}

/**
 * Tambah Perangkat Baru ke Owner yang sudah login
 */
export async function ownerAddDeviceAction({ userId, qrCode }) {
  await ensureDatabaseInitialized();

  // Auto-resolve userId from session
  if (!userId) {
    const session = await getCurrentSession();
    userId = session?.user?.id;
  }

  if (!userId) return { success: false, error: 'Sesi tidak valid. Silakan login ulang.' };

  const code = (qrCode || '').trim().toUpperCase();
  if (!code) return { success: false, error: 'Kode Cobascan tidak boleh kosong.' };

  const { qrCodes } = await import('@/lib/db/schema');
  const qr = await db.query.qrCodes.findFirst({
    where: eq(qrCodes.code, code),
  });

  if (!qr) return { success: false, error: `Kode ${code} tidak ditemukan.` };
  if (qr.status === 'active' && qr.businessId) {
    return { success: false, error: `Kode ${code} sudah aktif dan digunakan oleh bisnis lain.` };
  }
  if (qr.status === 'disabled') {
    return { success: false, error: `Kode ${code} dinonaktifkan. Hubungi Admin.` };
  }

  // Cari business milik owner ini
  const ownerBusiness = await db.query.businesses.findFirst({
    where: eq(businesses.ownerId, userId),
  });

  if (!ownerBusiness) {
    return { success: false, error: 'Anda belum memiliki bisnis terdaftar.' };
  }

  // Link QR ke business owner
  const { eq: drizzleEq } = await import('drizzle-orm');
  await db.update(qrCodes)
    .set({
      businessId: ownerBusiness.id,
      status: 'active',
      activatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(qrCodes.id, qr.id));

  return { success: true, message: `Perangkat ${code} berhasil ditambahkan ke bisnis Anda.` };
}
