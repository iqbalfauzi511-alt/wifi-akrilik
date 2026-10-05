import React from 'react';

export const WifiCard: React.FC<{
  wifiName: string;
  wifiPass: string;
  style?: React.CSSProperties;
}> = ({ wifiName, wifiPass, style }) => {
  return (
    <div style={{
      width: 700,
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: 48,
      padding: 60,
      boxShadow: '0 30px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 30,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      ...style
    }}>
      <div style={{
        width: 140, height: 140, borderRadius: 70,
        background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: '0 15px 30px rgba(2, 132, 199, 0.3)'
      }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </div>
      
      <div style={{ fontSize: 40, fontWeight: '800', color: '#0f172a', marginTop: 10, letterSpacing: '-1px' }}>
        Wi-Fi Terhubung
      </div>
      
      <div style={{ width: '100%', backgroundColor: 'white', borderRadius: 24, padding: 40, marginTop: 10, boxShadow: '0 10px 20px rgba(0,0,0,0.02), inset 0 0 0 1px #e2e8f0' }}>
        <div style={{ fontSize: 24, color: '#64748b', fontWeight: '500' }}>Network Name</div>
        <div style={{ fontSize: 40, fontWeight: 'bold', color: '#0f172a', marginTop: 12 }}>{wifiName}</div>
        
        <div style={{ height: 2, backgroundColor: '#f1f5f9', margin: '30px 0' }} />
        
        <div style={{ fontSize: 24, color: '#64748b', fontWeight: '500' }}>Password</div>
        <div style={{ fontSize: 40, fontWeight: 'bold', color: '#0f172a', marginTop: 12, letterSpacing: 4, fontFamily: 'monospace' }}>{wifiPass}</div>
      </div>
      
      <div style={{
        backgroundColor: '#0f172a',
        color: 'white',
        padding: '36px',
        borderRadius: 24,
        textAlign: 'center',
        fontSize: 32,
        fontWeight: 'bold',
        width: '100%',
        marginTop: 20,
        boxShadow: '0 10px 20px rgba(15,23,42,0.2)'
      }}>
        Copy Password
      </div>
    </div>
  );
};
