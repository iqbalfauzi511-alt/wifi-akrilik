import React from 'react';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { users, businesses, qrCodes } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pengguna & Bisnis — Smart Wi-Fi Admin',
};

export default async function AdminUsersPage() {
  await ensureDatabaseInitialized();

  // Fetch all businesses with owner user information and active QR count
  const businessList = await db
    .select({
      id: businesses.id,
      businessName: businesses.businessName,
      instagramUrl: businesses.instagramUrl,
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
    .groupBy(businesses.id, users.id);

  // Fetch all users without a business yet
  const allUsers = await db.select().from(users);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Mitra &amp; Pengguna Terdaftar</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Daftar seluruh pemilik kafe yang telah mengaktifkan Smart Wi-Fi QR.
        </p>
      </div>

      {/* Businesses Table */}
      <Card>
        <CardHeader
          title={`Mitra Bisnis (${businessList.length})`}
          subtitle="Daftar kafe/bisnis yang terdaftar di platform"
        />

        {businessList.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            Belum ada bisnis yang terdaftar atau diaktivasi.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-y border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 font-semibold">Nama Bisnis</th>
                  <th className="py-3 px-4 font-semibold">Pemilik</th>
                  <th className="py-3 px-4 font-semibold">Link Instagram</th>
                  <th className="py-3 px-4 font-semibold">Nama Wi-Fi</th>
                  <th className="py-3 px-4 font-semibold text-center">Jumlah QR</th>
                  <th className="py-3 px-4 font-semibold">Terdaftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {businessList.map((biz) => (
                  <tr key={biz.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {biz.businessName}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{biz.ownerName || biz.ownerEmail}</div>
                      <div className="text-[11px] text-slate-400">{biz.ownerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold">
                      <a
                        href={biz.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:text-brand-700 underline truncate max-w-[180px] block"
                      >
                        {biz.instagramUrl}
                      </a>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                      {biz.wifiName}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {biz.qrCount} QR
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(biz.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* All Users Summary */}
      <Card>
        <CardHeader
          title={`Total Pengguna (${allUsers.length})`}
          subtitle="Seluruh akun terdaftar di sistem (Admin & Customer)"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-y border-slate-200/80">
              <tr>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Nama</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Tanggal Bergabung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">{u.email}</td>
                  <td className="py-3 px-4 text-slate-700">{u.name || '-'}</td>
                  <td className="py-3 px-4">
                    <Badge
                      label={u.role.toUpperCase()}
                      variant={u.role === 'admin' ? 'sold' : 'active'}
                    />
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
