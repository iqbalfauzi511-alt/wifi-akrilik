'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  AlertTriangle,
  User,
  ShieldCheck,
  Search,
  CheckCircle2,
  MailCheck,
  MailWarning,
  Building,
} from 'lucide-react';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { deleteUserAction } from '@/lib/actions/admin-actions';

export default function AdminUsersManager({
  initialUsers = [],
  currentAdminEmail = '',
}) {
  const router = useRouter();

  const [users, setUsers] = useState(initialUsers);
  const [userSearch, setUserSearch] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Filter users
  const filteredUsers = users.filter((u) => {
    const term = userSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      u.email?.toLowerCase().includes(term) ||
      u.name?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term) ||
      u.businessName?.toLowerCase().includes(term)
    );
  });

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalOwners = users.filter((u) => u.role !== 'admin').length;
  const verifiedUsers = users.filter((u) => Boolean(u.emailVerified)).length;

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
        setNotification({
          type: 'success',
          message: `Pengguna ${targetEmail} berhasil dihapus dari sistem.`,
        });
        router.refresh();
      } else {
        alert(res?.error || 'Gagal menghapus pengguna');
      }
    } catch {
      setIsDeleting(false);
      alert('Terjadi kendala saat menghapus pengguna');
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="text-slate-400 text-xs font-medium">Total Akun</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalUsers}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Terdaftar di platform</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="text-slate-400 text-xs font-medium">Pemilik Bisnis</div>
          <div className="text-2xl font-black text-brand-600 mt-1">{totalOwners}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Mitra kafe &amp; resto</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="text-slate-400 text-xs font-medium">Admin Cobascan</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalAdmins}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Hak akses sistem</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="text-slate-400 text-xs font-medium">Email Terverifikasi</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{verifiedUsers}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Dari {totalUsers} akun</div>
        </div>
      </div>

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

      {/* All Users Table */}
      <Card>
        <CardHeader
          title={`Daftar Pengguna (${users.length})`}
          subtitle="Kelola seluruh akun pengguna terdaftar, status verifikasi, dan hak akses"
          action={
            <div className="w-full sm:w-72 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Cari email, nama, atau bisnis..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-y border-slate-200/80">
              <tr>
                <th className="py-3 px-4 font-semibold">Pengguna</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Verifikasi Email</th>
                <th className="py-3 px-4 font-semibold">Bisnis</th>
                <th className="py-3 px-4 font-semibold">Tanggal Terdaftar</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada pengguna yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAdmin =
                    u.role === 'admin' ||
                    u.email === currentAdminEmail ||
                    u.email === 'admin@smartwifi.com' ||
                    u.email === 'distrapness@gmail.com';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{u.name || '-'}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                            <ShieldCheck className="w-3 h-3" />
                            Admin Cobascan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                            <User className="w-3 h-3" />
                            Pemilik Bisnis
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            <MailCheck className="w-3 h-3 text-emerald-600" />
                            Terverifikasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                            <MailWarning className="w-3 h-3 text-amber-600" />
                            Belum Verifikasi
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.businessName ? (
                          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{u.businessName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum aktivasi bisnis</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isAdmin ? (
                          <span className="text-[10px] font-bold text-slate-400 px-2 py-1 rounded-md bg-slate-100 border border-slate-200">
                            Dilindungi
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
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
                  Akun pengguna ini akan dihapus secara permanen beserta data bisnis yang dimilikinya. Seluruh perangkat QR yang terhubung akan dilepas dan dikembalikan ke status BLANK agar dapat digunakan kembali.
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
