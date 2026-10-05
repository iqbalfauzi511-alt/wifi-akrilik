import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { PhoneMockup } from './components/PhoneMockup';
import { CobascanStand } from './components/CobascanStand';
import { NFCAnimation } from './components/NFCAnimation';
import { ReviewCard } from './components/ReviewCard';
import { WifiCard } from './components/WifiCard';

export const CobascanIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Background Gradient
  const bgProgress = interpolate(frame, [0, 450], [0, 100]);

  // Hook Text (0-90)
  const hookY = interpolate(spring({ frame, fps, config: { damping: 14 } }), [0, 1], [200, 0]);
  const hookOpacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0]);

  // Solution Stand (90-450)
  const standFrame = frame - 90;
  const standY = interpolate(spring({ frame: standFrame, fps, config: { damping: 12 } }), [0, 1], [800, 0]);
  const standScale = interpolate(spring({ frame: standFrame, fps, config: { damping: 12 } }), [0, 1], [0.5, 0.9]);

  // Phone Mockup (130-450)
  const phoneFrame = frame - 130;
  const phoneX = interpolate(spring({ frame: phoneFrame, fps, config: { damping: 14 } }), [0, 1], [1000, 150]);
  const phoneY = interpolate(spring({ frame: phoneFrame, fps, config: { damping: 14 } }), [0, 1], [1200, 250]);
  const phoneScale = interpolate(spring({ frame: phoneFrame, fps, config: { damping: 14 } }), [0, 1], [0.7, 1]);
  const phoneRotate = interpolate(spring({ frame: phoneFrame, fps, config: { damping: 14 } }), [0, 1], [20, -5]);

  // Screen content transition (Review -> Wifi)
  const screenFrame = frame - 220;
  const reviewScale = interpolate(spring({ frame: screenFrame, fps, config: { damping: 14 } }), [0, 1], [0.5, 0.85]);
  const reviewOpacity = interpolate(screenFrame, [0, 15, 60, 75], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  
  const wifiFrame = frame - 300;
  const wifiScale = interpolate(spring({ frame: wifiFrame, fps, config: { damping: 14 } }), [0, 1], [0.5, 0.85]);
  const wifiOpacity = interpolate(wifiFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // CTA Text (360-450)
  const ctaFrame = frame - 360;
  const ctaY = interpolate(spring({ frame: ctaFrame, fps, config: { damping: 14 } }), [0, 1], [400, 0]);
  const ctaOpacity = interpolate(ctaFrame, [0, 15], [0, 1]);

  return (
    <AbsoluteFill style={{ 
      background: `radial-gradient(circle at 50% \${bgProgress}%, #ffffff 0%, #e2e8f0 100%)`, 
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* 0-3s: Hook */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            fontSize: 72, fontWeight: '900', color: '#0f172a', textAlign: 'center',
            width: '80%', transform: `translateY(\${hookY}px)`, opacity: hookOpacity,
            lineHeight: 1.2, letterSpacing: '-2px'
          }}>
            Susah dapet review Google <br/> dari tamu kafe?
          </div>
          <div style={{
             fontSize: 40, fontWeight: '500', color: '#64748b', textAlign: 'center', marginTop: 40,
             opacity: hookOpacity, transform: `translateY(\${hookY}px)`
          }}>
            Selesaikan dengan satu ketukan.
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* 3s+: Stand */}
      <Sequence from={90}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ transform: `translateY(\${standY}px) scale(\${standScale})`, position: 'absolute', left: -50, top: 150 }}>
            <CobascanStand />
            {/* NFC Pulse */}
            <Sequence from={50} durationInFrames={120}>
               <NFCAnimation style={{ position: 'absolute', top: -50, left: 100 }} />
            </Sequence>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* 4s+: Phone Demo */}
      <Sequence from={130}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ 
            position: 'absolute', 
            transform: `translate(\${phoneX}px, \${phoneY}px) scale(\${phoneScale}) rotate(\${phoneRotate}deg)`,
          }}>
            <PhoneMockup style={{ width: 680, height: 1350 }}>
               {/* Phone Screen: Google Review */}
               <Sequence from={90}>
                 <AbsoluteFill style={{ backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', opacity: reviewOpacity }}>
                   <ReviewCard businessName="Kopi Senja" style={{ transform: `scale(\${reviewScale})` }} />
                 </AbsoluteFill>
               </Sequence>

               {/* Phone Screen: Wifi */}
               <Sequence from={170}>
                 <AbsoluteFill style={{ backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', opacity: wifiOpacity }}>
                   <WifiCard wifiName="Kopi Senja Guest" wifiPass="senja123" style={{ transform: `scale(\${wifiScale})` }} />
                 </AbsoluteFill>
               </Sequence>
            </PhoneMockup>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* 12s+: CTA */}
      <Sequence from={360}>
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 150 }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '60px 100px',
            borderRadius: 60,
            textAlign: 'center',
            transform: `translateY(\${ctaY}px)`,
            opacity: ctaOpacity,
            boxShadow: '0 40px 80px rgba(15, 23, 42, 0.4), inset 0 2px 4px rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ fontSize: 56, fontWeight: '900', color: 'white', letterSpacing: '-1px' }}>
              Tingkatkan Reputasi.
            </div>
            <div style={{ color: '#38bdf8', fontSize: 44, fontWeight: 'bold', marginTop: 20 }}>
              Pesan COBASCAN Sekarang!
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

    </AbsoluteFill>
  );
};
