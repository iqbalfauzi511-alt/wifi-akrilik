import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const QRScanner: React.FC<{
  scanSuccess?: boolean;
}> = ({ scanSuccess = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scanning laser beam animation (sweeps vertically)
  const laserProgress = (frame % 40) / 40;
  const laserY = interpolate(laserProgress, [0, 0.5, 1], [40, 360, 40]);

  // URL Banner entrance spring
  const bannerSpring = spring({
    frame: frame - 40,
    fps,
    config: { damping: 14, mass: 0.5 },
  });

  const bannerOpacity = interpolate(bannerSpring, [0, 1], [0, 1]);
  const bannerY = interpolate(bannerSpring, [0, 1], [-20, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Camera Live Viewfinder Background (Blurred Cafe Camera Feed) */}
      <Img
        src={staticFile('acrylic-stand-cafe.jpg')}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.7) blur(2px)',
          transform: 'scale(1.15)',
        }}
      />

      {/* Darkened Viewfinder Overlay with clear scan cutout */}
      <div
        style={{
          position: 'relative',
          width: 440,
          height: 440,
          borderRadius: 36,
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: scanSuccess
            ? '0 0 60px rgba(16, 185, 129, 0.8), 0 0 0 9999px rgba(15, 23, 42, 0.65)'
            : '0 0 40px rgba(59, 130, 246, 0.4), 0 0 0 9999px rgba(15, 23, 42, 0.65)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* The QR Target preview */}
        <Img
          src={staticFile('barcode_cobascan.jpg')}
          style={{
            width: '90%',
            height: '90%',
            objectFit: 'contain',
            borderRadius: 24,
            filter: 'contrast(1.1)',
          }}
        />

        {/* Viewfinder Target Reticle Corners */}
        <div style={{ position: 'absolute', top: 16, left: 16, width: 44, height: 44, borderTop: scanSuccess ? '5px solid #10B981' : '5px solid #3B82F6', borderLeft: scanSuccess ? '5px solid #10B981' : '5px solid #3B82F6', borderRadius: '12px 0 0 0' }} />
        <div style={{ position: 'absolute', top: 16, right: 16, width: 44, height: 44, borderTop: scanSuccess ? '5px solid #10B981' : '5px solid #3B82F6', borderRight: scanSuccess ? '5px solid #10B981' : '5px solid #3B82F6', borderRadius: '0 12px 0 0' }} />
        <div style={{ position: 'absolute', bottom: 16, left: 16, width: 44, height: 44, borderBottom: scanSuccess ? '5px solid #10B981' : '5px solid #3B82F6', borderLeft: scanSuccess ? '5px solid #10B981' : '5px solid #3B82F6', borderRadius: '0 0 0 12px' }} />
        <div style={{ position: 'absolute', bottom: 16, right: 16, width: 44, height: 44, borderBottom: scanSuccess ? '5px solid #10B981' : '5px solid #3B82F6', borderRight: scanSuccess ? '5px solid #10B981' : '5px solid #3B82F6', borderRadius: '0 0 12px 0' }} />

        {/* Scanning Laser Beam */}
        {!scanSuccess && (
          <div
            style={{
              position: 'absolute',
              left: 20,
              right: 20,
              top: laserY,
              height: 4,
              background: 'linear-gradient(90deg, transparent 0%, #3B82F6 20%, #60A5FA 50%, #3B82F6 80%, transparent 100%)',
              boxShadow: '0 0 16px #3B82F6, 0 0 8px #60A5FA',
              borderRadius: 2,
            }}
          />
        )}

        {/* Success checkmark pop */}
        {scanSuccess && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(16, 185, 129, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                backgroundColor: '#10B981',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.6)',
              }}
            >
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 24, marginTop: 12, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              QR Berhasil Discan
            </div>
          </div>
        )}
      </div>

      {/* Camera UI Bottom Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 60,
        }}
      >
        <div style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <div style={{ width: 80, height: 80, borderRadius: 40, border: '4px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'white' }} />
        </div>
        <div style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        </div>
      </div>

      {/* Floating QR Scanned URL Pill Banner */}
      {frame >= 35 && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 36,
            right: 36,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 24,
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
            opacity: bannerOpacity,
            transform: `translateY(${bannerY}px)`,
            zIndex: 70,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: '#1E293B',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div>
              <div style={{ color: '#94A3B8', fontSize: 14, fontWeight: 600 }}>Tautan Ditemukan:</div>
              <div style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
                cobascan.my.id/q/CS-KOPI88
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '10px 18px',
              backgroundColor: '#1A73E8',
              borderRadius: 14,
              color: 'white',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            Buka
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
