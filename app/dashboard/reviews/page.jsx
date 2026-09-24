import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Star, MessageSquare, ExternalLink, Calendar, User, Phone, CheckCircle2 } from 'lucide-react';
import { getCurrentSession } from '@/lib/auth/session';
import { getBusinessesByOwnerId } from '@/lib/db/queries/business';
import { db, ensureDatabaseInitialized } from '@/lib/db';
import { customerFeedback } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ulasan & Feedback: Cobascan Pemilik Bisnis',
};

export default async function CustomerReviewsPage() {
  await ensureDatabaseInitialized();
  const session = await getCurrentSession();
  if (session?.role === 'admin') {
    redirect('/admin');
  }

  const userId = session?.user?.id;
  const userBusinesses = userId
    ? await getBusinessesByOwnerId(userId).catch(() => [])
    : [];

  const business = userBusinesses[0] || session?.business;

  let feedbacks = [];
  if (business?.id) {
    feedbacks = await db
      .select()
      .from(customerFeedback)
      .where(eq(customerFeedback.businessId, business.id))
      .orderBy(desc(customerFeedback.createdAt))
      .catch(() => []);
  }

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((a, b) => a + (b.rating || 5), 0) / feedbacks.length).toFixed(1)
    : '4.8';

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
            Ulasan &amp; Masukan Pelanggan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Kelola ulasan Google Review dan pesan masukan langsung dari pelanggan di {business?.businessName || 'bisnis Anda'}.
          </p>
        </div>

        {business?.googleMapsReviewUrl && (
          <a
            href={business.googleMapsReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            <span>Buka Google Review Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Top Rating Summary Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-8 h-8 fill-amber-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">{avgRating}</span>
              <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400" />
              ))}
              <span className="text-xs text-slate-500 ml-2 font-medium">
                Berdasarkan interaksi pelanggan
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 text-xs text-slate-600">
          <div>
            <div className="font-bold text-slate-900 text-lg">{feedbacks.length}</div>
            <div className="text-slate-400 text-[11px]">Masukan Langsung (Rating 1-2)</div>
          </div>
        </div>
      </div>

      {/* Feedbacks List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
        <h2 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-600" />
          <span>Daftar Masukan &amp; Keluhan Pelanggan</span>
        </h2>

        {feedbacks.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Belum Ada Keluhan</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Pelanggan yang memberikan rating 1-2 bintang akan mengirimkan masukan yang tercatat di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center text-amber-500">
                      {[...Array(item.rating || 1)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {item.customerName || 'Pelanggan'}
                    </span>
                    {item.customerPhone && (
                      <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {item.customerPhone}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                  &ldquo;{item.message}&rdquo;
                </p>

                {item.customerPhone && (
                  <div className="mt-3 flex justify-end">
                    <a
                      href={`https://wa.me/${item.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${item.customerName || ''}, terima kasih atas masukan Anda di ${business?.businessName || ''}. Kami ingin menindaklanjuti keluhan Anda.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Hubungi Pelanggan via WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
