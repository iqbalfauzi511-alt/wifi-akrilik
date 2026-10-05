import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const SceneTransition: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
  transitionDuration?: number;
  type?: 'fade' | 'zoom' | 'slideUp';
}> = ({
  children,
  durationInFrames,
  transitionDuration = 12,
  type = 'fade',
}) => {
  const frame = useCurrentFrame();

  // Fade In (beginning of scene)
  const fadeIn = interpolate(frame, [0, transitionDuration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade Out (end of scene)
  const fadeOut = interpolate(
    frame,
    [durationInFrames - transitionDuration, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  // Zoom effect
  const zoomScale = interpolate(
    frame,
    [0, durationInFrames],
    [1, 1.05],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Slide up entrance
  const translateY = interpolate(frame, [0, transitionDuration], [25, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform:
          type === 'zoom'
            ? `scale(${zoomScale})`
            : type === 'slideUp'
            ? `translateY(${translateY}px)`
            : 'none',
        overflow: 'hidden',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
