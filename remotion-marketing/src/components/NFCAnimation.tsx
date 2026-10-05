import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Easing } from 'remotion';

export const NFCAnimation: React.FC<{
  color?: string;
  style?: React.CSSProperties;
}> = ({ color = '#1A73E8', style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress1 = ((frame) % (fps * 1.5)) / (fps * 1.5);
  const progress2 = ((frame + fps * 0.5) % (fps * 1.5)) / (fps * 1.5);
  const progress3 = ((frame + fps * 1.0) % (fps * 1.5)) / (fps * 1.5);
  
  const getScale = (p: number) => interpolate(p, [0, 1], [0.1, 3], { easing: Easing.bezier(0.25, 1, 0.5, 1) });
  const getOpacity = (p: number) => interpolate(p, [0, 0.2, 1], [0, 0.6, 0]);

  return (
    <div style={{
      position: 'relative',
      width: 400,
      height: 400,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      ...style
    }}>
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', border: `6px solid \${color}`, transform: `scale(\${getScale(progress1)})`, opacity: getOpacity(progress1) }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', border: `6px solid \${color}`, transform: `scale(\${getScale(progress2)})`, opacity: getOpacity(progress2) }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', border: `6px solid \${color}`, transform: `scale(\${getScale(progress3)})`, opacity: getOpacity(progress3) }} />
      
      <div style={{ position: 'absolute', width: 60, height: 60, borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 40px \${color}` }} />
    </div>
  );
};
