'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  AlertTriangle,
  Building,
  User,
  ExternalLink,
  ShieldCheck,
  Search,
  CheckCircle2,
} from 'lucide-react';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { deleteBusinessAction, deleteUserAction } from '@/lib/actions/admin-actions';

export default function AdminUsersManager({
  initialBusinesses = [],
  initialUsers = [],
  currentAdminEmail = '',
}) {
  const router = useRouter();

  const [businesses, setBusinesses] = useState(initialBusinesses);
  const [users, setUsers] = useState(initialUsers);

  const [businessSearch, setBusinessSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const [businessToDelete, setBusinessToDelete] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Filter businesses
  const filteredBusinesses = businesses.filter((b) => {
    const term = businessSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      b.businessName?.toLowerCase().includes(term) ||
      b.ownerEmail?.toLowerCase().includes(term) ||
      b.ownerName?.toLowerCase().includes(term) ||
      b.wifiName?.toLowerCase().includes(term)
    );
  });

  // Filter users
  const filteredUsers = users.filter((u) => {
    const term = userSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      u.email?.toLowerCase().includes(term) ||
      u.name?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  });

  // Handle Delete Business
  const handleDeleteBusiness = async () => {
    if (!businessToDelete) return;

    try {
      setIsDeleting(true);
      const targetId = businessToDelete.id;
      const targetName = businessToDelete.businessName;

      const res = await deleteBusinessAction(targetId);
      setIsDeleting(false);
      setBusinessToDelete(null);

      if (res?.success) {
        setBusinesses((prev) => prev.filter((b) => b.id !== targetId));
        setNotification({
          type: 'success',
          message: `Bisnis "${targetName}" berhasil dihapus. Seluruh QR terkait telah di-reset ke status BLANK.`,
        });
        router.refresh();
      } else {
        alert(res?.error || 'Gagal menghapus bisnis');
      }
    } catch (err) {
      setIsDeleting(false);
      alert('Terjadi kendala saat menghapus bisnis');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      const targetId = userToDelete.id;
      const targetEmail = userToDelete.email;

      const res = await deleteUserAction(targetId);
      setIsDeleting(false);
      setUserToDelete(null);

      if (res?.success) {
        setUsers((prev) => prev.filter((u) => u.id !== targetId));
        setBusinesses((prev) => prev.filter((b) => b.ownerId !== targetId));
        setNotification({
          type: 'success',
          message: `Pengguna ${targetEmail} berhasil dihapus dari sistem.`,
        });
        router.refresh();
      } else {
        alert(res?.error || 'Gagal menghapus pengguna');
      }
    } catch (err) {
      setIsDeleting(false);
      alert('Terjadi kendala saat menghapus pengguna');
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold ml-4 p-1 rounded-lg hover:bg-black/5"
          >
            &times;
          </button>
        </div>
      )}

      {/* Businesses Table */}
      <Card>
        <CardHeader
          title={`Mitra Bisnis (${businesses.length})`}
          subtitle="Daftar kafe/bisnis yang terdaftar di platform"
          action={
            <div className="w-64 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={businessSearch}
                onChange={(e) => setBusinessSearch(e.target.value)}
                placeholder="Cari bisnis atau pemilik..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          }
        />

        {filteredBusinesses.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">
            {businessSearch ? 'Tidak ada bisnis yang cocok dengan pencarian.' : 'Belum ada bisnis yang terdaftar.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-y border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 font-semibold">Nama Bisnis</th>
                  <th className="py-3 px-4 font-semibold">Pemilik</th>
                  <th className="py-3 px-4 font-semibold">Review Maps</th>
                  <th className="py-3 px-4 font-semibold">Nama Wi-Fi</th>
                  <th className="py-3 px-4 font-semibold text-center">Jumlah QR</th>
                  <th className="py-3 px-4 font-semibold">Terdaftar</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBusinesses.map((biz) => {
                  const mapsUrl = biz.googleMapsReviewUrl || biz.googleMapsUrl;
                  return (
                    <tr key={biz.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {biz.businessName}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{biz.ownerName || biz.ownerEmail}</div>
                        <div className="text-[11px] text-slate-400">{biz.ownerEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold">
                        {mapsUrl ? (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-600 hover:text-brand-700 underline truncate max-w-[180px] block"
                            title={mapsUrl}
                          >
                            {mapsUrl}
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">Belum diatur</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                        {biz.wifiEnabled && biz.wifiName ? biz.wifiName : <span className="text-slate-400 italic">—</span>}
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
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBusinessToDelete(biz)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus Bisnis ini"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* All Users Summary */}
      <Card>
        <CardHeader
          title={`Total Pengguna (${users.length})`}
          subtitle="Seluruh akun terdaftar di sistem (Admin & Mitra)"
          action={
            <div className="w-64 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Cari user email atau nama..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-y border-slate-200/80">
              <tr>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Nama</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Tanggal Bergabung</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isAdmin = u.role === 'admin' || u.email === currentAdminEmail || u.email === 'distrapness@gmail.com';
                return (
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
                    <td className="py-3 px-4 text-right">
                      {isAdmin ? (
                        <span className="text-[11px] font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-100">
                          Protected
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUserToDelete(u)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus Akun Pengguna ini"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Business Confirmation Modal */}
      <Modal
        isOpen={!!businessToDelete}
        onClose={() => setBusinessToDelete(null)}
        title="Hapus Bisnis"
        description="Tindakan ini tidak dapat dibatalkan."
      >
        {businessToDelete && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-rose-900">
                  Hapus Bisnis &ldquo;{businessToDelete.businessName}&rdquo;?
                </p>
                <p className="mt-1 leading-relaxed text-rose-700">
                  Profil bisnis ini akan dihapus dari sistem.
                  <span className="block mt-1 font-semibold text-rose-800">
                    Seluruh QR Code ({businessToDelete.qrCount || 0} QR) yang sebelumnya terhubung dengan bisnis ini akan otomatis dilepas dan kembali ke status BLANK (siap digunakan/diaktivasi kembali).
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBusinessToDelete(null)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                onClick={handleDeleteBusiness}
              >
                Hapus Bisnis
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Hapus Pengguna"
        description="Tindakan ini tidak dapat dibatalkan."
      >
        {userToDelete && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-rose-900">
                  Hapus Pengguna {userToDelete.email}?
                </p>
                <p className="mt-1 leading-relaxed text-rose-700">
                  Akun pengguna ini akan dihapus secara permanen beserta bisnis yang dimilikinya. QR Code yang terhubung akan dilepas dan kembali ke status BLANK.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                onClick={handleDeleteUser}
              >
                Hapus Pengguna
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
