import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const TextOverlay: React.FC<{
  title: string;
  subtitle?: string;
  badge?: string;
  position?: 'top' | 'center' | 'bottom';
  variant?: 'pill' | 'hero' | 'minimal';
  theme?: 'dark' | 'light';
}> = ({
  title,
  subtitle,
  badge,
  position = 'bottom',
  variant = 'pill',
  theme = 'dark',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 16,
      mass: 0.6,
      stiffness: 110,
    },
  });

  const translateY = interpolate(entrance, [0, 1], [30, 0]);
  const opacity = interpolate(entrance, [0, 0.4, 1], [0, 0.8, 1]);

  let positionStyle: React.CSSProperties = {
    bottom: 120,
    left: 40,
    right: 40,
  };

  if (position === 'top') {
    positionStyle = {
      top: 100,
      left: 40,
      right: 40,
    };
  } else if (position === 'center') {
    positionStyle = {
      top: '50%',
      left: 40,
      right: 40,
      transform: `translateY(-50%) translateY(${translateY}px)`,
    };
  }

  const isLight = theme === 'light';

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        pointerEvents: 'none',
        opacity,
        transform: position === 'center' ? positionStyle.transform : `translateY(${translateY}px)`,
        ...positionStyle,
      }}
    >
      {badge && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 20px',
            borderRadius: 999,
            backgroundColor: isLight ? 'rgba(26, 115, 232, 0.12)' : 'rgba(26, 115, 232, 0.25)',
            border: isLight ? '1px solid rgba(26, 115, 232, 0.25)' : '1px solid rgba(26, 115, 232, 0.5)',
            color: isLight ? '#1A73E8' : '#60A5FA',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 16,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' }} />
          {badge}
        </div>
      )}

      {variant === 'pill' ? (
        <div
          style={{
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 23, 42, 0.82)',
            border: isLight ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 32,
            padding: '24px 44px',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.05)',
            maxWidth: 960,
          }}
        >
          <div
            style={{
              color: isLight ? '#0F172A' : '#F8FAFC',
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                color: isLight ? '#64748B' : '#94A3B8',
                fontSize: 26,
                fontWeight: 500,
                marginTop: 8,
                letterSpacing: '-0.01em',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      ) : variant === 'hero' ? (
        <div style={{ maxWidth: 960 }}>
          <div
            style={{
              color: '#FFFFFF',
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              textShadow: '0 4px 24px rgba(0,0,0,0.6)',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                color: '#E2E8F0',
                fontSize: 32,
                fontWeight: 500,
                marginTop: 16,
                letterSpacing: '-0.01em',
                textShadow: '0 2px 12px rgba(0,0,0,0.5)',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            color: isLight ? '#0F172A' : '#FFFFFF',
            fontSize: 34,
            fontWeight: 700,
            textShadow: isLight ? 'none' : '0 2px 12px rgba(0,0,0,0.4)',
          }}
        >
          {title}
        </div>
      )}
    </div>
  );
};
