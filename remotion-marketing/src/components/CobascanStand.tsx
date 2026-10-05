import React from 'react';
import { Img, interpolate, staticFile, useCurrentFrame } from 'remotion';

export const CobascanStand: React.FC<{
  style?: React.CSSProperties;
  scale?: number;
  highlightQR?: boolean;
  highlightNFC?: boolean;
  qrSuccess?: boolean;
  nfcPulse?: boolean;
}> = ({
  style,
  scale = 1,
  highlightQR = false,
  highlightNFC = false,
  qrSuccess = false,
  nfcPulse = false,
}) => {
  const frame = useCurrentFrame();

  const pulse = Math.sin(frame / 6) * 0.5 + 0.5;

  return (
    <div
      style={{
        position: 'relative',
        width: 620,
        height: 940,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...style,
      }}
    >
      {/* Acrylic Cast Shadow */}
      <div
        style={{
          position: 'absolute',
          bottom: -30,
          left: '10%',
          right: '10%',
          height: 60,
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, transparent 70%)',
          filter: 'blur(16px)',
          zIndex: 0,
        }}
      />

      {/* Main Acrylic Body */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 880,
          background: 'linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(241,245,249,0.92) 100%)',
          borderRadius: '36px 36px 8px 8px',
          boxShadow: '0 40px 90px rgba(15, 23, 42, 0.25), 0 10px 30px rgba(0,0,0,0.12), inset 0 2px 6px rgba(255,255,255,1), inset 0 -3px 8px rgba(0,0,0,0.06)',
          border: '3px solid rgba(255, 255, 255, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '44px 36px',
          overflow: 'hidden',
          zIndex: 2,
        }}
      >
        {/* Optical Acrylic Glare/Reflection */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(115deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.15) 30%, transparent 45%, rgba(255,255,255,0.3) 65%, transparent 75%)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />

        {/* TOP: NFC AREA */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 28,
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              background: highlightNFC || nfcPulse
                ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
                : 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#FFFFFF',
              boxShadow: highlightNFC || nfcPulse
                ? `0 0 ${30 + pulse * 20}px rgba(37, 99, 235, 0.7)`
                : '0 8px 24px rgba(15, 23, 42, 0.25)',
              border: highlightNFC ? '3px solid #60A5FA' : '2px solid rgba(255,255,255,0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            {/* NFC Icon Waves */}
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 10a6 6 0 0 1 12 0" />
              <path d="M8 12a4 4 0 0 1 8 0" />
              <path d="M10 14a2 2 0 0 1 4 0" />
              <circle cx="12" cy="18" r="1" fill="currentColor" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', marginTop: 2 }}>
              NFC TAP
            </span>
          </div>

          {/* NFC Pulse Waves */}
          {nfcPulse && (
            <div
              style={{
                position: 'absolute',
                top: -15,
                left: -15,
                width: 140,
                height: 140,
                borderRadius: 70,
                border: '3px solid rgba(59, 130, 246, 0.6)',
                transform: `scale(${1 + pulse * 0.4})`,
                opacity: 1 - pulse * 0.8,
                pointerEvents: 'none',
              }}
            />
          )}
        </div>

        {/* MIDDLE: QR CODE CONTAINER */}
        <div
          style={{
            position: 'relative',
            width: 440,
            height: 440,
            backgroundColor: '#FFFFFF',
            borderRadius: 28,
            padding: 24,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: highlightQR
              ? `0 0 45px rgba(37, 99, 235, 0.4), 0 12px 30px rgba(0,0,0,0.12)`
              : qrSuccess
              ? `0 0 50px rgba(16, 185, 129, 0.7)`
              : '0 12px 32px rgba(15, 23, 42, 0.08)',
            border: qrSuccess
              ? '4px solid #10B981'
              : highlightQR
              ? '4px solid #3B82F6'
              : '2px solid #E2E8F0',
            zIndex: 5,
            transition: 'all 0.3s ease',
          }}
        >
          {/* Authentic Cobascan QR Code Image */}
          <Img
            src={staticFile('barcode_cobascan.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: 16,
            }}
          />

          {/* QR Corner Targets */}
          <div style={{ position: 'absolute', top: 14, left: 14, width: 24, height: 24, borderTop: '4px solid #1A73E8', borderLeft: '4px solid #1A73E8', borderRadius: '6px 0 0 0' }} />
          <div style={{ position: 'absolute', top: 14, right: 14, width: 24, height: 24, borderTop: '4px solid #1A73E8', borderRight: '4px solid #1A73E8', borderRadius: '0 6px 0 0' }} />
          <div style={{ position: 'absolute', bottom: 14, left: 14, width: 24, height: 24, borderBottom: '4px solid #1A73E8', borderLeft: '4px solid #1A73E8', borderRadius: '0 0 0 6px' }} />
          <div style={{ position: 'absolute', bottom: 14, right: 14, width: 24, height: 24, borderBottom: '4px solid #1A73E8', borderRight: '4px solid #1A73E8', borderRadius: '0 0 6px 0' }} />

          {/* Success Overlay Checkmark */}
          {qrSuccess && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderRadius: 24,
                display: 'flex',
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
                  boxShadow: '0 10px 30px rgba(16, 185, 129, 0.5)',
                }}
              >
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM: BRANDING & INSTRUCTIONS */}
        <div
          style={{
            marginTop: 'auto',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Img
              src={staticFile('cobascan-logo.png')}
              style={{
                height: 44,
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              }}
            />
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#64748B',
              textTransform: 'uppercase',
            }}
          >
            Google Review &amp; Wi-Fi Access
          </div>
        </div>
      </div>

      {/* Solid Acrylic Base Stand Footing */}
      <div
        style={{
          position: 'relative',
          width: 580,
          height: 38,
          backgroundColor: '#E2E8F0',
          borderRadius: '4px 4px 18px 18px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -4px 6px rgba(0,0,0,0.15)',
          border: '2px solid rgba(255,255,255,0.8)',
          borderTop: 'none',
          zIndex: 3,
        }}
      />
    </div>
  );
};
