import React from 'react';
import { AbsoluteFill } from 'remotion';

export const PhoneMockup: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  showStatusBar?: boolean;
  statusTime?: string;
  theme?: 'dark' | 'light';
}> = ({
  children,
  style,
  showStatusBar = true,
  statusTime = '09:41',
  theme = 'light',
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width: 820,
        height: 1680,
        backgroundColor: '#0F172A',
        borderRadius: 84,
        boxShadow: '0 40px 120px -20px rgba(15, 23, 42, 0.6), 0 0 0 14px #1E293B, 0 0 0 16px rgba(255,255,255,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '18px solid #0B0F19',
        ...style,
      }}
    >
      {/* Side Hardware Buttons */}
      <div style={{ position: 'absolute', left: -20, top: 220, width: 6, height: 50, backgroundColor: '#334155', borderTopRightRadius: 4, borderBottomRightRadius: 4 }} />
      <div style={{ position: 'absolute', left: -20, top: 310, width: 6, height: 90, backgroundColor: '#334155', borderTopRightRadius: 4, borderBottomRightRadius: 4 }} />
      <div style={{ position: 'absolute', left: -20, top: 430, width: 6, height: 90, backgroundColor: '#334155', borderTopRightRadius: 4, borderBottomRightRadius: 4 }} />
      <div style={{ position: 'absolute', right: -20, top: 320, width: 6, height: 130, backgroundColor: '#334155', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }} />

      {/* Screen Container */}
      <AbsoluteFill
        style={{
          backgroundColor: theme === 'dark' ? '#0F172A' : '#F8FAFC',
          borderRadius: 66,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Status Bar */}
        {showStatusBar && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 64,
              padding: '16px 44px 0 44px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 80,
              color: theme === 'dark' ? '#FFFFFF' : '#0F172A',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            <span>{statusTime}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* 5G */}
              <span style={{ fontSize: 16, fontWeight: 800 }}>5G</span>
              {/* Signal Bars */}
              <svg width="22" height="16" viewBox="0 0 22 16" fill="currentColor">
                <rect x="1" y="11" width="3.5" height="5" rx="1" />
                <rect x="6.5" y="8" width="3.5" height="8" rx="1" />
                <rect x="12" y="4" width="3.5" height="12" rx="1" />
                <rect x="17.5" y="0" width="3.5" height="16" rx="1" />
              </svg>
              {/* Battery */}
              <div
                style={{
                  width: 32,
                  height: 16,
                  borderRadius: 5,
                  border: '2px solid currentColor',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: '85%', height: '100%', backgroundColor: 'currentColor', borderRadius: 2 }} />
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Island */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 210,
            height: 48,
            backgroundColor: '#000000',
            borderRadius: 24,
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#0B0F19', boxShadow: 'inset 0 0 2px rgba(255,255,255,0.2)' }} />
          <div style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>

        {/* Screen Content Wrapper */}
        <div
          style={{
            width: '100%',
            height: '100%',
            paddingTop: showStatusBar ? 72 : 0,
            paddingBottom: 40,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>

        {/* Home Bar Indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 260,
            height: 6,
            backgroundColor: theme === 'dark' ? '#FFFFFF' : '#0F172A',
            borderRadius: 3,
            opacity: 0.35,
            zIndex: 85,
          }}
        />
      </AbsoluteFill>
    </div>
  );
};
