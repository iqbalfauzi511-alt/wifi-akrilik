import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const CobascanPublicPage: React.FC<{
  businessName?: string;
  activeSelection?: 'review' | 'wifi' | 'none';
  reviewCompleted?: boolean;
  highlightReviewButton?: boolean;
  highlightWifiButton?: boolean;
  buttonScale?: number;
}> = ({
  businessName = 'Kopi Senja Cafe',
  activeSelection = 'none',
  reviewCompleted = false,
  highlightReviewButton = false,
  highlightWifiButton = false,
  buttonScale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, mass: 0.6, stiffness: 100 },
  });

  const cardY = interpolate(entrance, [0, 1], [40, 0]);
  const cardOpacity = interpolate(entrance, [0, 0.4, 1], [0, 0.8, 1]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 28px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Top Browser URL Bar */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #E2E8F0',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#334155' }}>
            cobascan.my.id/q/CS-KOPI88
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        </div>
      </div>

      {/* Main Business Card from actual VisitorScanExperience */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 36,
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.08)',
          padding: '36px 32px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `translateY(${cardY}px)`,
          opacity: cardOpacity,
        }}
      >
        {/* Business Avatar / Logo */}
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: 26,
            backgroundColor: '#FFFBEB',
            border: '2px solid #FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            boxShadow: '0 8px 16px rgba(245, 158, 11, 0.1)',
            overflow: 'hidden',
          }}
        >
          <Img
            src={staticFile('cafe-latte.jpg')}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Business Name */}
        <div style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 8 }}>
          {businessName}
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 18, color: '#64748B', lineHeight: 1.4, maxWidth: 480, marginBottom: 28 }}>
          Selamat datang! Berikan ulasan atau akses koneksi Wi-Fi bisnis kami dengan mudah.
        </div>

        {/* Star Rating Prompt */}
        <div
          style={{
            width: '100%',
            paddingTop: 24,
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 12 }}>
            Bagaimana Pengalaman Anda?
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                width="38"
                height="38"
                viewBox="0 0 24 24"
                fill={reviewCompleted ? '#F59E0B' : '#E2E8F0'}
                stroke={reviewCompleted ? '#F59E0B' : '#CBD5E1'}
                strokeWidth="1.5"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          <div style={{ fontSize: 14, color: reviewCompleted ? '#10B981' : '#94A3B8', fontWeight: 600 }}>
            {reviewCompleted ? 'Ulasan Bintang 5 Dikirim' : 'Pilih bintang untuk menulis ulasan'}
          </div>
        </div>

        {/* Action Choice 1: Google Review */}
        <div
          style={{
            width: '100%',
            padding: '22px 24px',
            borderRadius: 24,
            backgroundColor: highlightReviewButton ? '#EFF6FF' : '#FFFFFF',
            border: highlightReviewButton ? '3px solid #1A73E8' : '2px solid #E2E8F0',
            boxShadow: highlightReviewButton ? '0 12px 30px rgba(26,115,232,0.2)' : '0 4px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            transform: highlightReviewButton ? `scale(${buttonScale})` : 'scale(1)',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #BFDBFE',
              }}
            >
              <Img src={staticFile('google-maps.svg')} style={{ width: 32, height: 32 }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
                Google Review
              </div>
              <div style={{ fontSize: 14, color: '#64748B', marginTop: 2 }}>
                {reviewCompleted ? '✓ Ulasan Anda telah diposting' : 'Beri rating bintang 5 di Google Maps'}
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '10px 18px',
              borderRadius: 14,
              backgroundColor: reviewCompleted ? '#ECFDF5' : '#1A73E8',
              color: reviewCompleted ? '#059669' : '#FFFFFF',
              fontSize: 16,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {reviewCompleted ? 'Selesai' : 'Buka'}
          </div>
        </div>

        {/* Action Choice 2: Wi-Fi */}
        <div
          style={{
            width: '100%',
            padding: '22px 24px',
            borderRadius: 24,
            backgroundColor: highlightWifiButton ? '#F0FDF4' : '#FFFFFF',
            border: highlightWifiButton ? '3px solid #10B981' : '2px solid #E2E8F0',
            boxShadow: highlightWifiButton ? '0 12px 30px rgba(16,185,129,0.2)' : '0 4px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transform: highlightWifiButton ? `scale(${buttonScale})` : 'scale(1)',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #A7F3D0',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
              </svg>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
                Akses Wi-Fi
              </div>
              <div style={{ fontSize: 14, color: '#64748B', marginTop: 2 }}>
                Koneksi internet cepat untuk tamu
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '10px 18px',
              borderRadius: 14,
              backgroundColor: highlightWifiButton ? '#10B981' : '#F1F5F9',
              color: highlightWifiButton ? '#FFFFFF' : '#334155',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            Lihat Wi-Fi
          </div>
        </div>
      </div>

      {/* Powered by Cobascan Footer */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          opacity: 0.7,
        }}
      >
        <span style={{ fontSize: 14, color: '#64748B', fontWeight: 600 }}>Didukung oleh</span>
        <Img src={staticFile('cobascan-logo.png')} style={{ height: 22, objectFit: 'contain' }} />
      </div>
    </div>
  );
};
