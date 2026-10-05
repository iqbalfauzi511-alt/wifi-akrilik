import React from 'react';
import { Img, staticFile } from 'remotion';

export const ReviewCard: React.FC<{
  businessName: string;
  style?: React.CSSProperties;
}> = ({ businessName, style }) => {
  return (
    <div style={{
      width: 700,
      backgroundColor: 'white',
      borderRadius: 48,
      padding: 60,
      boxShadow: '0 30px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: 40,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      ...style
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
        <div style={{
          width: 120, height: 120, borderRadius: '50%',
          backgroundColor: '#f1f5f9', display: 'flex',
          justifyContent: 'center', alignItems: 'center',
          fontSize: 48, fontWeight: 'bold', color: '#1A73E8',
          boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.05)'
        }}>
          {businessName.charAt(0)}
        </div>
        <div>
          <div style={{ fontSize: 44, fontWeight: '800', color: '#0f172a', letterSpacing: '-1px' }}>{businessName}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="44" height="44" viewBox="0 0 24 24" fill="#FBBC04">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
      <div style={{
        height: 240,
        backgroundColor: '#f8fafc',
        borderRadius: 24,
        padding: 30,
        fontSize: 32,
        color: '#94a3b8',
        border: '2px solid #e2e8f0',
        lineHeight: 1.5
      }}>
        Pelayanan sangat cepat dan WiFi-nya kencang! Tempat yang nyaman untuk WFC.
      </div>
      <div style={{
        backgroundColor: '#1A73E8',
        color: 'white',
        padding: '36px',
        borderRadius: 24,
        textAlign: 'center',
        fontSize: 36,
        fontWeight: 'bold',
        boxShadow: '0 15px 30px rgba(26,115,232,0.3)',
        letterSpacing: '1px'
      }}>
        Posting Review
      </div>
    </div>
  );
};
