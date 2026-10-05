import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const WifiPage: React.FC<{
  ssid?: string;
  password?: string;
}> = ({
  ssid = 'KopiSenja_Guest',
  password = 'kopisenja2024',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Button copy interaction at frame 45
  const isCopied = frame >= 45;

  const copySpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 14, mass: 0.5 },
  });

  const buttonScale = isCopied ? interpolate(copySpring, [0, 0.4, 1], [1, 0.94, 1]) : 1;

  // Masked to unmasked password reveal
  const isRevealed = frame >= 20;

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
      {/* Top Browser Bar */}
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
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#334155' }}>
            cobascan.my.id/q/CS-KOPI88/wifi
          </span>
        </div>
      </div>

      {/* Main Wi-Fi Card matching VisitorScanExperience */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 36,
          border: '2px solid #A7F3D0',
          boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.15)',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 22,
              backgroundColor: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #A7F3D0',
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#0F172A' }}>
              Wi-Fi Terbuka!
            </div>
            <div style={{ fontSize: 16, color: '#059669', fontWeight: 600, marginTop: 2 }}>
              Akses internet khusus pengunjung
            </div>
          </div>
        </div>

        {/* Credentials Box */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 26,
            border: '1px solid #E2E8F0',
            padding: '24px 26px',
            marginBottom: 28,
          }}
        >
          {/* SSID Field */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Nama Wi-Fi (SSID)
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
              {ssid}
            </div>
          </div>

          <div style={{ height: 1, backgroundColor: '#E2E8F0', marginBottom: 20 }} />

          {/* Password Field */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password Wi-Fi
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'monospace', color: '#0F172A', marginTop: 4, letterSpacing: isRevealed ? '0.04em' : '0.2em' }}>
              {isRevealed ? password : '••••••••••••'}
            </div>
          </div>
        </div>

        {/* Big Action Button: Salin Password */}
        <button
          style={{
            width: '100%',
            padding: '22px 28px',
            borderRadius: 22,
            backgroundColor: isCopied ? '#059669' : '#0F172A',
            color: '#FFFFFF',
            fontSize: 20,
            fontWeight: 800,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            boxShadow: isCopied ? '0 12px 30px rgba(5,150,105,0.35)' : '0 10px 25px rgba(15,23,42,0.25)',
            transform: `scale(${buttonScale})`,
            transition: 'all 0.2s ease',
          }}
        >
          {isCopied ? (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Password Tersalin!</span>
            </>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Salin Password</span>
            </>
          )}
        </button>

        {isCopied && (
          <div
            style={{
              marginTop: 16,
              fontSize: 15,
              fontWeight: 600,
              color: '#059669',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span>Password siap digunakan di pengaturan Wi-Fi</span>
          </div>
        )}
      </div>

      {/* Real Step Photo Reference Card */}
      <div
        style={{
          marginTop: 24,
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          border: '1px solid #E2E8F0',
          position: 'relative',
          height: 340,
        }}
      >
        <Img
          src={staticFile('step-wifi-success.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: 24,
            color: 'white',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 800 }}>Akses Internet Instan</div>
          <div style={{ fontSize: 14, color: '#E2E8F0', marginTop: 4 }}>
            Tidak perlu repot bertanya password ke kasir
          </div>
        </div>
      </div>
    </div>
  );
};
