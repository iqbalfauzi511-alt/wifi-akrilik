import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';

export const CafeEnvironment: React.FC<{
  blur?: number;
  scale?: number;
  opacity?: number;
  overlayOpacity?: number;
  panX?: number;
  panY?: number;
}> = ({
  blur = 0,
  scale = 1.05,
  opacity = 1,
  overlayOpacity = 0.35,
  panX = 0,
  panY = 0,
}) => {
  const frame = useCurrentFrame();

  // Subtle breathing motion for realistic ambient camera feel
  const breathe = Math.sin(frame / 45) * 0.015;
  const currentScale = scale + breathe;

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#0f172a' }}>
      <Img
        src={staticFile('acrylic-stand-cafe.jpg')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${currentScale}) translate(${panX}px, ${panY}px)`,
          filter: `blur(${blur}px) brightness(0.92) contrast(1.05)`,
          opacity,
          transition: 'filter 0.3s ease',
        }}
      />

      {/* Cinematic Vignette & Warm Cafe Ambient Tint */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, rgba(15, 23, 42, ${overlayOpacity * 0.4}) 0%, rgba(15, 23, 42, ${overlayOpacity * 1.2}) 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Soft warm light beam */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, transparent 60%, rgba(15, 23, 42, 0.4) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
