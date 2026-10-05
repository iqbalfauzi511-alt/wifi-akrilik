import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const WifiConnected: React.FC<{
  ssid?: string;
}> = ({ ssid = 'KopiSenja_Guest' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Progress sequence:
  // 0-30: In Wi-Fi settings, searching/connecting
  // 30-60: Connecting spinner to Connected checkmark
  // 60+: Connected status with IP assigned & full signal
  const isConnected = frame >= 35;

  const checkSpring = spring({
    frame: frame - 35,
    fps,
    config: { damping: 12, mass: 0.5 },
  });
  const checkScale = isConnected ? interpolate(checkSpring, [0, 1], [0.6, 1]) : 0;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#F1F5F9',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* iOS Style Settings Header */}
      <div
        style={{
          padding: '24px 28px 16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#007AFF', fontSize: 18, fontWeight: 600 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Pengaturan</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>
          Wi-Fi
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ padding: '0 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Wi-Fi Main Toggle Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 28,
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Wi-Fi</span>
          {/* Active Switch */}
          <div
            style={{
              width: 58,
              height: 34,
              borderRadius: 17,
              backgroundColor: '#34C759',
              padding: 3,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
          </div>
        </div>

        {/* Section Title */}
        <div style={{ fontSize: 14, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, paddingLeft: 8 }}>
          Jaringan Saya
        </div>

        {/* Active Connected Network Row */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: '22px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            border: isConnected ? '2px solid #10B981' : '2px solid #E2E8F0',
            marginBottom: 20,
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Checkmark or Spinner */}
            <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isConnected ? (
                <div style={{ transform: `scale(${checkScale})` }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              ) : (
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    border: '3px solid #E2E8F0',
                    borderTop: '3px solid #007AFF',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              )}
            </div>

            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
                {ssid}
              </div>
              <div style={{ fontSize: 14, color: isConnected ? '#10B981' : '#64748B', fontWeight: 600, marginTop: 2 }}>
                {isConnected ? 'Terhubung • Internet Aman' : 'Menghubungkan...'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Wi-Fi Signal Bars */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={isConnected ? '#059669' : '#64748B'} strokeWidth="2.5">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
            </svg>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                border: '2px solid #007AFF',
                color: '#007AFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              i
            </div>
          </div>
        </div>

        {/* Other Networks List Preview */}
        <div style={{ fontSize: 14, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, paddingLeft: 8 }}>
          Jaringan Lainnya
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          {['Cafe_Staff_Private', 'Mall_Public_WiFi'].map((name, i) => (
            <div
              key={name}
              style={{
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: i === 0 ? '1px solid #F1F5F9' : 'none',
                opacity: 0.6,
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 600, color: '#334155' }}>{name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Success Connected Banner Pill */}
        {isConnected && (
          <div
            style={{
              marginTop: 'auto',
              marginBottom: 20,
              backgroundColor: '#ECFDF5',
              border: '2px solid #10B981',
              borderRadius: 24,
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              boxShadow: '0 10px 25px rgba(16,185,129,0.2)',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#065F46' }}>
                Terhubung ke Internet!
              </div>
              <div style={{ fontSize: 14, color: '#047857', marginTop: 2 }}>
                Customer kini bisa berselancar online dengan lancar
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
