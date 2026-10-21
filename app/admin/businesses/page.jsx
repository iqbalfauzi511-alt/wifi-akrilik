import React from 'react';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { businesses, users, qrCodes } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import AdminBusinessesManager from '@/components/admin/AdminBusinessesManager';
import { autoConvertMapsUrl } from '@/lib/utils/maps';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mitra Bisnis | Cobascan Admin',
};

export default async function AdminBusinessesPage() {
  await ensureDatabaseInitialized();

  // Fetch all businesses with owner details, device review links, and QR count
  // Zero-mutation read query: combines business & hardware QR settings seamlessly
  const rawBusinesses = await db
    .select({
      id: businesses.id,
      businessName: businesses.businessName,
      logoUrl: businesses.logoUrl,
      googleMapsReviewUrl: businesses.googleMapsReviewUrl,
      googleMapsUrl: businesses.googleMapsUrl,
      deviceReviewUrl: sql`max(nullif(${qrCodes.googleMapsReviewUrl}, ''))`,
      deviceMapsUrl: sql`max(nullif(${qrCodes.googleMapsUrl}, ''))`,
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
    .catch((err) => {
      console.error('Error fetching admin businesses:', err);
      return [];
    });

  // Read-layer synchronization:
  // If business doesn't have an explicit review URL, synchronize with device URL.
  // Auto-convert standard Maps URLs to direct write-review URLs without modifying database.
  const allBusinesses = rawBusinesses.map((b) => {
    const bizUrl = (b.googleMapsReviewUrl || b.googleMapsUrl || '').trim();
    const devUrl = (b.deviceReviewUrl || b.deviceMapsUrl || '').trim();

    let rawReviewUrl = '';
    let mapsSource = 'none'; // 'business' | 'device' | 'none'

    // Read-layer synchronization:
    // Prioritize device URL (latest settings updated by owner on their hardware)
    // Fall back to business-level registration URL
    if (devUrl) {
      rawReviewUrl = devUrl;
      mapsSource = 'device';
    } else if (bizUrl) {
      rawReviewUrl = bizUrl;
      mapsSource = 'business';
    }

    const convertedReviewUrl = rawReviewUrl ? autoConvertMapsUrl(rawReviewUrl) : null;

    return {
      ...b,
      rawReviewUrl: rawReviewUrl || null,
      effectiveReviewUrl: convertedReviewUrl || rawReviewUrl || null,
      mapsSource,
      isAutoConverted: Boolean(convertedReviewUrl && convertedReviewUrl !== rawReviewUrl),
    };
  });

  return (
    <div className="px-3 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-7xl mx-auto w-full space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Mitra Bisnis Terdaftar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola data mitra, verifikasi sinkronisasi Google Review, dan perangkat Cobascan yang aktif.
          </p>
        </div>
      </div>

      <AdminBusinessesManager initialBusinesses={allBusinesses} />
    </div>
  );
}
