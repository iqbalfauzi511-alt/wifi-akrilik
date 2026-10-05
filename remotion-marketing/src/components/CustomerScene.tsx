import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { CafeEnvironment } from './CafeEnvironment';
import { CobascanStand } from './CobascanStand';

export const CustomerScene: React.FC<{
  mode: 'arrival' | 'inspect' | 'relax';
  businessName?: string;
}> = ({ mode, businessName = 'Kopi Senja Cafe' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Mode: 'arrival' (Scene 01)
  // Camera moves from wide cafe to table surface approaching the Cobascan stand
  if (mode === 'arrival') {
    const pushIn = interpolate(frame, [0, 90], [1.02, 1.18]);
    const panY = interpolate(frame, [0, 90], [0, -30]);

    return (
      <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#0F172A' }}>
        {/* Real Cafe Photography with smooth push-in */}
        <Img
          src={staticFile('acrylic-stand-cafe.jpg')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${pushIn}) translateY(${panY}px)`,
            filter: 'brightness(0.95) contrast(1.05)',
          }}
        />

        {/* Ambient subtle vignette */}
        <AbsoluteFill
          style={{
            background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(15, 23, 42, 0.6) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Soft focal indicator circle highlighting the Cobascan stand on the table */}
        <div
          style={{
            position: 'absolute',
            top: '48%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 320,
            height: 480,
            borderRadius: 40,
            border: '2px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)',
            opacity: interpolate(frame, [25, 55], [0, 0.8]),
            pointerEvents: 'none',
          }}
        />
      </AbsoluteFill>
    );
  }

  // Mode: 'inspect' (Scene 02)
  // Close-up Macro view of the physical acrylic stand with dual QR and NFC highlights
  if (mode === 'inspect') {
    const entrance = spring({
      frame,
      fps,
      config: { damping: 14, mass: 0.6 },
    });
    const standScale = interpolate(entrance, [0, 1], [0.95, 1.05]);

    return (
      <AbsoluteFill
        style={{
          overflow: 'hidden',
          backgroundColor: '#0F172A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Warm cafe bokeh background */}
        <CafeEnvironment blur={14} overlayOpacity={0.65} />

        {/* Crisp Macro Acrylic Stand */}
        <div style={{ position: 'relative', zIndex: 20 }}>
          <CobascanStand scale={standScale} highlightQR={true} highlightNFC={true} />

          {/* Interactive Callout Badges pointing to NFC & QR */}
          {/* 1. NFC Badge on Top */}
          <div
            style={{
              position: 'absolute',
              top: 50,
              right: -140,
              backgroundColor: 'rgba(37, 99, 235, 0.95)',
              border: '2px solid rgba(255,255,255,0.4)',
              borderRadius: 20,
              padding: '12px 24px',
              color: 'white',
              boxShadow: '0 10px 30px rgba(37,99,235,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              opacity: interpolate(frame, [10, 25], [0, 1]),
              transform: `translateX(${interpolate(frame, [10, 25], [30, 0])}px)`,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 10a6 6 0 0 1 12 0" />
              <path d="M8 12a4 4 0 0 1 8 0" />
              <circle cx="12" cy="18" r="1" fill="currentColor" />
            </svg>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', opacity: 0.85 }}>Metode 1</div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>TAP NFC</div>
            </div>
          </div>

          {/* 2. QR Badge on Middle */}
          <div
            style={{
              position: 'absolute',
              top: 360,
              left: -150,
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              border: '2px solid rgba(96, 165, 250, 0.6)',
              borderRadius: 20,
              padding: '12px 24px',
              color: 'white',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              opacity: interpolate(frame, [20, 35], [0, 1]),
              transform: `translateX(${interpolate(frame, [20, 35], [-30, 0])}px)`,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#93C5FD' }}>Metode 2</div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>SCAN QR</div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // Mode: 'relax' (Scene 10)
  // Customer enjoying cafe, relaxing, connected to internet
  const zoomRelax = interpolate(frame, [0, 90], [1.02, 1.1]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#0F172A' }}>
      {/* Real Cafe Table with Coffee Latte */}
      <Img
        src={staticFile('cafe-latte.jpg')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${zoomRelax})`,
          filter: 'brightness(0.9) contrast(1.05)',
        }}
      />

      <AbsoluteFill
        style={{
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%)',
        }}
      />

      {/* Floating Status Pill showing Customer is happily connected */}
      <div
        style={{
          position: 'absolute',
          top: 140,
          left: 40,
          right: 40,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 28,
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.8)',
          backdropFilter: 'blur(16px)',
          opacity: interpolate(frame, [10, 30], [0, 1]),
          transform: `translateY(${interpolate(frame, [10, 30], [-20, 0])}px)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
              Ulasan Terkirim &amp; Terhubung
            </div>
            <div style={{ fontSize: 14, color: '#059669', fontWeight: 600 }}>
              Menikmati internet cepat di {businessName}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontSize: 16, fontWeight: 800 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
          </svg>
          <span>Online</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
