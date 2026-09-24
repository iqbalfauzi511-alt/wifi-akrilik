import React from 'react';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { businesses, users, qrCodes } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import AdminBusinessesManager from '@/components/admin/AdminBusinessesManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Bisnis: Cobascan Admin',
};

export default async function AdminBusinessesPage() {
  await ensureDatabaseInitialized();

  // Fetch all businesses with owner details and QR count
  const allBusinesses = await db
    .select({
      id: businesses.id,
      businessName: businesses.businessName,
      logoUrl: businesses.logoUrl,
      googleMapsReviewUrl: businesses.googleMapsReviewUrl,
      googleMapsUrl: businesses.googleMapsUrl,
      wifiEnabled: businesses.wifiEnabled,
      wifiName: businesses.wifiName,
      whatsappNumber: businesses.whatsappNumber,
      createdAt: businesses.createdAt,
      ownerEmail: users.email,
      ownerName: users.name,
      qrCount: sql`cast(count(${qrCodes.id}) as integer)`,
    })
    .from(businesses)
    .innerJoin(users, eq(businesses.ownerId, users.id))
    .leftJoin(qrCodes, eq(businesses.id, qrCodes.businessId))
    .groupBy(
      businesses.id,
      businesses.businessName,
      businesses.logoUrl,
      businesses.googleMapsReviewUrl,
      businesses.googleMapsUrl,
      businesses.wifiEnabled,
      businesses.wifiName,
      businesses.whatsappNumber,
      businesses.createdAt,
      users.email,
      users.name
    )
    .catch(() => []);

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
          Mitra Bisnis Terdaftar
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Kelola seluruh profil bisnis, kafe, dan restoran yang menggunakan platform Cobascan.
        </p>
      </div>

      <AdminBusinessesManager initialBusinesses={allBusinesses} />
    </div>
  );
}
