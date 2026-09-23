import React from 'react';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { users, businesses, qrCodes } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getCurrentSession } from '@/lib/auth/session';
import AdminUsersManager from '@/components/admin/AdminUsersManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pengguna & Bisnis: Cobascan Admin',
};

export default async function AdminUsersPage() {
  await ensureDatabaseInitialized();
  const session = await getCurrentSession();

  // Fetch all businesses and users in parallel
  const [businessList, allUsers] = await Promise.all([
    db
      .select({
        id: businesses.id,
        ownerId: businesses.ownerId,
        businessName: businesses.businessName,
        googleMapsReviewUrl: businesses.googleMapsReviewUrl,
        googleMapsUrl: businesses.googleMapsUrl,
        wifiEnabled: businesses.wifiEnabled,
        wifiName: businesses.wifiName,
        createdAt: businesses.createdAt,
        ownerEmail: users.email,
        ownerName: users.name,
        ownerRole: users.role,
        qrCount: sql`cast(count(${qrCodes.id}) as integer)`,
      })
      .from(businesses)
      .innerJoin(users, eq(businesses.ownerId, users.id))
      .leftJoin(qrCodes, eq(businesses.id, qrCodes.businessId))
      .groupBy(
        businesses.id,
        businesses.ownerId,
        businesses.businessName,
        businesses.googleMapsReviewUrl,
        businesses.googleMapsUrl,
        businesses.wifiEnabled,
        businesses.wifiName,
        businesses.createdAt,
        users.id,
        users.email,
        users.name,
        users.role
      )
      .catch((err) => {
        console.warn('businessList query error:', err?.message || err);
        return [];
      }),
    db
      .select()
      .from(users)
      .catch((err) => {
        console.warn('allUsers query error:', err?.message || err);
        return [];
      }),
  ]);

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Mitra &amp; Pengguna Terdaftar</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Kelola seluruh mitra bisnis dan akun pengguna yang terdaftar di platform.
        </p>
      </div>

      <AdminUsersManager
        initialBusinesses={businessList}
        initialUsers={allUsers}
        currentAdminEmail={session?.user?.email || ''}
      />
    </div>
  );
}
