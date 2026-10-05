import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const NFCScanner: React.FC<{
  tapProgress?: number;
}> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring of phone approaching stand
  const approach = spring({
    frame,
    fps,
    config: { damping: 15, mass: 0.7, stiffness: 90 },
  });

  const phoneY = interpolate(approach, [0, 0.6, 1], [300, 20, 0]);
  const phoneScale = interpolate(approach, [0, 0.6, 1], [0.85, 1.02, 1]);

  // Tap ripple trigger around frame 20
  const tapFrame = Math.max(0, frame - 18);
  const rippleProgress = interpolate(tapFrame, [0, 35], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  const rippleRadius = interpolate(rippleProgress, [0, 1], [40, 280]);
  const rippleOpacity = interpolate(rippleProgress, [0, 0.2, 1], [0, 0.9, 0]);

  // Banner "NFC Tag Ditemukan"
  const bannerSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 14, mass: 0.5 },
  });
  const bannerY = interpolate(bannerSpring, [0, 1], [-40, 0]);
  const bannerOpacity = interpolate(bannerSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0F172A',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background showing the physical Cobascan stand NFC top area */}
      <Img
        src={staticFile('step-tap-nfc.jpg')}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.85)',
          transform: 'scale(1.05)',
        }}
      />

      {/* Dark vignette */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.75) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* NFC Tap Emission Ripples */}
      {frame >= 18 && (
        <div
          style={{
            position: 'absolute',
            top: '32%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 30,
          }}
        >
          {/* Ring 1 */}
          <div
            style={{
              position: 'absolute',
              top: -rippleRadius / 2,
              left: -rippleRadius / 2,
              width: rippleRadius,
              height: rippleRadius,
              borderRadius: rippleRadius / 2,
              border: '4px solid #60A5FA',
              boxShadow: '0 0 30px #3B82F6',
              opacity: rippleOpacity,
            }}
          />
          {/* Ring 2 */}
          <div
            style={{
              position: 'absolute',
              top: -(rippleRadius * 1.4) / 2,
              left: -(rippleRadius * 1.4) / 2,
              width: rippleRadius * 1.4,
              height: rippleRadius * 1.4,
              borderRadius: (rippleRadius * 1.4) / 2,
              border: '3px solid #93C5FD',
              opacity: rippleOpacity * 0.7,
            }}
          />
          {/* Central Flash */}
          <div
            style={{
              position: 'absolute',
              top: -30,
              left: -30,
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 50px #60A5FA, 0 0 100px #3B82F6',
              opacity: interpolate(rippleProgress, [0, 0.2, 0.6], [0, 1, 0]),
            }}
          />
        </div>
      )}

      {/* Floating Modern "TAP!" Indicator Badge */}
      <div
        style={{
          position: 'absolute',
          top: '24%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 28px',
          borderRadius: 999,
          backgroundColor: 'rgba(37, 99, 235, 0.95)',
          color: 'white',
          fontSize: 24,
          fontWeight: 900,
          letterSpacing: '0.1em',
          boxShadow: '0 10px 30px rgba(37, 99, 235, 0.6)',
          border: '2px solid rgba(255,255,255,0.4)',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 10a6 6 0 0 1 12 0" />
          <path d="M8 12a4 4 0 0 1 8 0" />
          <path d="M10 14a2 2 0 0 1 4 0" />
          <circle cx="12" cy="18" r="1" fill="currentColor" />
        </svg>
        <span>NFC TAP INSTAN</span>
      </div>

      {/* iOS Style Floating Drop-down Notification on top */}
      {frame >= 22 && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 36,
            right: 36,
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 24,
            padding: '20px 26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 24px 50px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(24px)',
            opacity: bannerOpacity,
            transform: `translateY(${bannerY}px)`,
            zIndex: 60,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: '#2563EB',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 4px 14px rgba(37,99,235,0.5)',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M6 10a6 6 0 0 1 12 0" />
                <path d="M8 12a4 4 0 0 1 8 0" />
                <path d="M10 14a2 2 0 0 1 4 0" />
              </svg>
            </div>
            <div>
              <div style={{ color: '#93C5FD', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                NFC Tag Terbaca
              </div>
              <div style={{ color: '#FFFFFF', fontSize: 19, fontWeight: 800 }}>
                Kopi Senja Cafe
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: '#10B981',
              borderRadius: 14,
              color: 'white',
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            Membuka...
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
