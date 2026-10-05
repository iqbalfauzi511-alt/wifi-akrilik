import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { CobascanStand } from './CobascanStand';
import { PhoneMockup } from './PhoneMockup';
import { CobascanPublicPage } from './CobascanPublicPage';

export const ProductHero: React.FC<{
  businessName?: string;
}> = ({ businessName = 'Kopi Senja Cafe' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, mass: 0.8, stiffness: 80 },
  });

  const standScale = interpolate(entrance, [0, 1], [0.85, 1]);
  const phoneX = interpolate(entrance, [0, 1], [180, 0]);
  const phoneRotate = interpolate(entrance, [0, 1], [12, 6]);

  // Subtle breathing lighting
  const pulse = Math.sin(frame / 20) * 0.5 + 0.5;

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
      {/* Background: Cafe with warm blur & bokeh */}
      <Img
        src={staticFile('acrylic-stand-cafe.jpg')}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(20px) brightness(0.65)',
          transform: 'scale(1.15)',
        }}
      />

      {/* Atmospheric lighting gradients */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 50% 45%, rgba(37, 99, 235, 0.25) 0%, rgba(15, 23, 42, 0.85) 80%)',
          pointerEvents: 'none',
        }}
      />

      {/* Hero Physical Products Showcase */}
      <div
        style={{
          position: 'relative',
          width: 900,
          height: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: -60,
        }}
      >
        {/* Glow behind stand */}
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 700,
            borderRadius: 250,
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
            filter: 'blur(40px)',
            opacity: 0.7 + pulse * 0.3,
            zIndex: 1,
          }}
        />

        {/* Acrylic Stand in Center */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            zIndex: 10,
            transform: `scale(${standScale * 0.95})`,
            filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.5))',
          }}
        >
          <CobascanStand highlightNFC={true} nfcPulse={true} />
        </div>

        {/* Smartphone on the right side */}
        <div
          style={{
            position: 'absolute',
            right: 40,
            zIndex: 20,
            transform: `scale(0.58) rotate(${phoneRotate}deg) translateX(${phoneX}px)`,
            filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.6))',
          }}
        >
          <PhoneMockup>
            <CobascanPublicPage businessName={businessName} reviewCompleted={true} />
          </PhoneMockup>
        </div>
      </div>

      {/* Bottom Branding & Call to Action */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: 40,
          right: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 30,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <Img
            src={staticFile('cobascan-logo.png')}
            style={{
              height: 56,
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))',
            }}
          />
        </div>

        {/* Punchy Three Words */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 26, fontWeight: 900, color: '#60A5FA', letterSpacing: '0.15em' }}>SCAN</span>
          <span style={{ color: '#64748B', fontSize: 22 }}>•</span>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#38BDF8', letterSpacing: '0.15em' }}>TAP</span>
          <span style={{ color: '#64748B', fontSize: 22 }}>•</span>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#34D399', letterSpacing: '0.15em' }}>CONNECT</span>
        </div>

        {/* CTA Card */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: 28,
            padding: '20px 48px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Permudah Pengalaman Digital Pelanggan
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#2563EB', marginTop: 4 }}>
            Tingkatkan ulasan Google &amp; bagikan Wi-Fi dalam satu sentuhan
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
