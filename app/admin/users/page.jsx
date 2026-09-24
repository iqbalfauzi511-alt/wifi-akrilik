import React from 'react';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { users, businesses } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCurrentSession } from '@/lib/auth/session';
import AdminUsersManager from '@/components/admin/AdminUsersManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pengguna: Cobascan Admin',
};

export default async function AdminUsersPage() {
  await ensureDatabaseInitialized();
  const session = await getCurrentSession();

  const allUsersWithBusiness = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
      businessName: businesses.businessName,
    })
    .from(users)
    .leftJoin(businesses, eq(users.id, businesses.ownerId))
    .orderBy(desc(users.createdAt))
    .catch((err) => {
      console.warn('allUsers query error:', err?.message || err);
      return [];
    });

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
          Daftar Pengguna
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Kelola seluruh akun pengguna terdaftar, status verifikasi email, dan hak akses.
        </p>
      </div>

      <AdminUsersManager
        initialUsers={allUsersWithBusiness}
        currentAdminEmail={session?.user?.email || ''}
      />
    </div>
  );
}
