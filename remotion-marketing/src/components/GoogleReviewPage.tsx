import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const GoogleReviewPage: React.FC<{
  businessName?: string;
}> = ({ businessName = 'Kopi Senja Cafe' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Star rating progressive fill from frame 15 to 45
  const starCount = Math.min(5, Math.max(0, Math.floor((frame - 15) / 6) + 1));

  // Auto-typing effect for review text
  const fullReviewText = 'Kopi nikmat, tempat sangat nyaman untuk santai, dan stafnya ramah! Sangat direkomendasikan.';
  const typingProgress = Math.min(1, Math.max(0, (frame - 55) / 50));
  const currentChars = Math.floor(typingProgress * fullReviewText.length);
  const displayedText = fullReviewText.slice(0, currentChars);

  // Posting button press around frame 115
  const isPosting = frame >= 115;
  const isPosted = frame >= 135;

  const buttonSpring = spring({
    frame: frame - 115,
    fps,
    config: { damping: 12, mass: 0.4 },
  });
  const buttonScale = isPosting && !isPosted ? interpolate(buttonSpring, [0, 1], [1, 0.95]) : 1;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Google Maps Header Navigation Bar */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Img src={staticFile('google-maps.svg')} style={{ width: 26, height: 26 }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>
              Google Maps
            </span>
          </div>
        </div>

        <button
          style={{
            padding: '10px 24px',
            borderRadius: 999,
            backgroundColor: isPosted ? '#10B981' : isPosting ? '#1557B0' : '#1A73E8',
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: 700,
            border: 'none',
            boxShadow: '0 4px 12px rgba(26,115,232,0.3)',
            transform: `scale(${buttonScale})`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease',
          }}
        >
          {isPosted ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Diposting</span>
            </>
          ) : isPosting ? (
            <span>Memposting...</span>
          ) : (
            <span>Posting</span>
          )}
        </button>
      </div>

      {/* Main Review Form Body */}
      <div style={{ padding: '32px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Business Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid #E2E8F0',
            }}
          >
            <Img src={staticFile('cafe-latte.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>
              {businessName}
            </div>
            <div style={{ fontSize: 15, color: '#64748B', marginTop: 2 }}>
              Ulasan Publik • Berbagi pengalaman Anda
            </div>
          </div>
        </div>

        {/* Reviewer Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#3B82F6',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1E293B' }}>
              Andi Pratama
            </div>
            <div style={{ fontSize: 13, color: '#EAB308', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>★ Local Guide</span>
              <span style={{ color: '#94A3B8' }}>• 42 ulasan</span>
            </div>
          </div>
        </div>

        {/* 5 Star Selection */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 24,
            padding: '24px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 28,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: '#334155', marginBottom: 14 }}>
            Beri Nilai Tempat Ini:
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= starCount;
              return (
                <div
                  key={star}
                  style={{
                    transform: isFilled ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    fill={isFilled ? '#F59E0B' : '#E2E8F0'}
                    stroke={isFilled ? '#D97706' : '#CBD5E1'}
                    strokeWidth="1.5"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#F59E0B', marginTop: 12 }}>
            {starCount === 5 ? 'Sangat Puas! (Bintang 5)' : `${starCount} Bintang`}
          </div>
        </div>

        {/* Text Review Box */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#F8FAFC',
            borderRadius: 24,
            border: '1px solid #E2E8F0',
            padding: '20px 24px',
            position: 'relative',
          }}
        >
          <div style={{ fontSize: 18, color: '#1E293B', lineHeight: 1.5 }}>
            {displayedText}
            {typingProgress < 1 && frame >= 55 && (
              <span style={{ borderRight: '2px solid #1A73E8', animation: 'blink 0.8s infinite' }}>&nbsp;</span>
            )}
          </div>
          {typingProgress === 0 && (
            <span style={{ fontSize: 16, color: '#94A3B8' }}>
              Bagikan detail pengalaman Anda di tempat ini...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
