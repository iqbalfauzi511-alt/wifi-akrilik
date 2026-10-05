import React from 'react';
import { AbsoluteFill, Series, staticFile } from 'remotion';

// Import Reusable Components
import { CafeEnvironment } from './components/CafeEnvironment';
import { CobascanStand } from './components/CobascanStand';
import { PhoneMockup } from './components/PhoneMockup';
import { QRScanner } from './components/QRScanner';
import { NFCScanner } from './components/NFCScanner';
import { CobascanPublicPage } from './components/CobascanPublicPage';
import { GoogleReviewPage } from './components/GoogleReviewPage';
import { WifiPage } from './components/WifiPage';
import { WifiConnected } from './components/WifiConnected';
import { ProductHero } from './components/ProductHero';
import { TextOverlay } from './components/TextOverlay';
import { SceneTransition } from './components/SceneTransition';
import { CustomerScene } from './components/CustomerScene';

export const CobascanCustomerJourney: React.FC<{
  businessName?: string;
  wifiSsid?: string;
  wifiPassword?: string;
}> = ({
  businessName = 'Kopi Senja Cafe',
  wifiSsid = 'KopiSenja_Guest',
  wifiPassword = 'kopisenja2024',
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0F172A', overflow: 'hidden' }}>
      <Series>
        {/* ========================================================
            SCENE 01 — CUSTOMER DATANG (0–3s, 90 frames)
            ======================================================== */}
        <Series.Sequence durationInFrames={90}>
          <SceneTransition durationInFrames={90} transitionDuration={12} type="fade">
            <CustomerScene mode="arrival" businessName={businessName} />
            <TextOverlay
              badge="Pengalaman Nyata"
              title="Datang ke cafe."
              subtitle="Customer duduk santai dan menemukan Cobascan di atas meja"
              position="bottom"
              variant="pill"
            />
          </SceneTransition>
        </Series.Sequence>

        {/* ========================================================
            SCENE 02 — CUSTOMER MELIHAT COBASCAN (3–5s, 60 frames)
            ======================================================== */}
        <Series.Sequence durationInFrames={60}>
          <SceneTransition durationInFrames={60} transitionDuration={10} type="fade">
            <CustomerScene mode="inspect" businessName={businessName} />
            <TextOverlay
              badge="Dua Cara Akses"
              title="Scan atau tap."
              subtitle="Pilih cara tercepat yang Anda sukai: QR Code atau NFC"
              position="bottom"
              variant="pill"
            />
          </SceneTransition>
        </Series.Sequence>

        {/* ========================================================
            SCENE 03 — CUSTOMER SCAN QR (5–8s, 90 frames)
            ======================================================== */}
        <Series.Sequence durationInFrames={90}>
          <SceneTransition durationInFrames={90} transitionDuration={10} type="fade">
            <CafeEnvironment blur={16} overlayOpacity={0.7} />
            <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ transform: 'scale(0.88)' }}>
                <PhoneMockup>
                  <QRScanner scanSuccess={true} />
                </PhoneMockup>
              </div>
            </AbsoluteFill>
            <TextOverlay
              badge="Kamera Smartphone"
              title="Arahkan kamera ke QR Code"
              subtitle="Otomatis mendeteksi link Cobascan tanpa aplikasi tambahan"
              position="bottom"
              variant="pill"
            />
          </SceneTransition>
        </Series.Sequence>

        {/* ========================================================
            SCENE 04 — ALTERNATIF NFC (8–10s, 60 frames)
            ======================================================== */}
        <Series.Sequence durationInFrames={60}>
          <SceneTransition durationInFrames={60} transitionDuration={10} type="fade">
            <NFCScanner />
            <TextOverlay
              badge="Alternatif NFC"
              title="Atau cukup TAP smartphone Anda"
              subtitle="Sensor NFC membuka halaman Cobascan secara instan"
              position="bottom"
              variant="pill"
            />
          </SceneTransition>
        </Series.Sequence>

        {/* ========================================================
            SCENE 05 — HALAMAN COBASCAN TERBUKA (10–14s, 120 frames)
            ======================================================== */}
        <Series.Sequence durationInFrames={120}>
          <SceneTransition durationInFrames={120} transitionDuration={12} type="fade">
            <CafeEnvironment blur={18} overlayOpacity={0.75} />
            <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ transform: 'scale(0.88)' }}>
                <PhoneMockup>
                  <CobascanPublicPage
                    businessName={businessName}
                    highlightReviewButton={true}
                    buttonScale={1.03}
                  />
                </PhoneMockup>
              </div>
            </AbsoluteFill>
            <TextOverlay
              badge="Halaman Bisnis"
              title="Satu halaman untuk akses digital bisnis."
              subtitle="Pilihan langsung untuk Google Review atau informasi Wi-Fi"
              position="bottom"
              variant="pill"
            />
          </SceneTransition>
        </Series.Sequence>

        {/* ========================================================
            SCENE 06 — CUSTOMER MEMILIH GOOGLE REVIEW (14–19s, 150 frames)
            ======================================================== */}
        <Series.Sequence durationInFrames={150}>
          <SceneTransition durationInFrames={150} transitionDuration={12} type="fade">
            <CafeEnvironment blur={18} overlayOpacity={0.75} />
            <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ transform: 'scale(0.88)' }}>
                <PhoneMockup>
                  <GoogleReviewPage businessName={businessName} />
                </PhoneMockup>
              </div>
            </AbsoluteFill>
            <TextOverlay
              badge="Google Maps"
              title="Beri rating bintang 5 dengan mudah"
              subtitle="Langsung menuju halaman ulasan Google tanpa mencari manual"
              position="bottom"
              variant="pill"
            />
          </SceneTransition>
        </Series.Sequence>

        {/* ========================================================
            SCENE 07 — CUSTOMER KEMBALI KE COBASCAN (19–21s, 60 frames)
            ======================================================== */}
        <Series.Sequence durationInFrames={60}>
          <SceneTransition durationInFrames={60} transitionDuration={10} type="fade">
            <CafeEnvironment blur={18} overlayOpacity={0.75} />
            <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ transform: 'scale(0.88)' }}>
                <PhoneMockup>
                  <CobascanPublicPage
                    businessName={businessName}
                    reviewCompleted={true}
                    highlightWifiButton={true}
                    buttonScale={1.03}
                  />
                </PhoneMockup>
              </div>
            </AbsoluteFill>
            <TextOverlay
              badge="Navigasi Instan"
              title="Kembali ke Cobascan"
              subtitle="Customer dapat langsung melanjutkan akses ke fitur Wi-Fi"
              position="bottom"
              variant="pill"
            />
          </SceneTransition>
        </Series.Sequence>

        {/* ========================================================
            SCENE 08 — CUSTOMER MEMILIH WI-FI (21–25s, 120 frames)
            ======================================================== */}
        <Series.Sequence durationInFrames={120}>
          <SceneTransition durationInFrames={120} transitionDuration={12} type="fade">
            <CafeEnvironment blur={18} overlayOpacity={0.75} />
            <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ transform: 'scale(0.88)' }}>
                <PhoneMockup>
                  <WifiPage ssid={wifiSsid} password={wifiPassword} />
                </PhoneMockup>
              </div>
            </AbsoluteFill>
            <TextOverlay
              badge="Akses Wi-Fi"
              title="Informasi Wi-Fi dalam satu klik"
              subtitle="Nama jaringan dan password dapat disalin secara instan"
              position="bottom"
              variant="pill"
            />
          </SceneTransition>
        </Series.Sequence>

        {/* ========================================================
            SCENE 09 — CUSTOMER CONNECT KE WI-FI (25–29s, 120 frames)
            ======================================================== */}
        <Series.Sequence durationInFrames={120}>
          <SceneTransition durationInFrames={120} transitionDuration={12} type="fade">
            <CafeEnvironment blur={18} overlayOpacity={0.75} />
            <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ transform: 'scale(0.88)' }}>
                <PhoneMockup>
                  <WifiConnected ssid={wifiSsid} />
                </PhoneMockup>
              </div>
            </AbsoluteFill>
            <TextOverlay
              badge="Terhubung"
              title="Langsung terkoneksi ke Wi-Fi"
              subtitle="Tanpa perlu antre atau bertanya password ke kasir"
              position="bottom"
              variant="pill"
            />
          </SceneTransition>
        </Series.Sequence>

        {/* ========================================================
            SCENE 10 — CUSTOMER SELESAI (29–32s, 90 frames)
            ======================================================== */}
        <Series.Sequence durationInFrames={90}>
          <SceneTransition durationInFrames={90} transitionDuration={12} type="fade">
            <CustomerScene mode="relax" businessName={businessName} />
            <TextOverlay
              badge="Kepuasan Pelanggan"
              title="Semudah scan atau tap."
              subtitle="Customer menikmati kunjungan dan cafe mendapatkan ulasan positif"
              position="bottom"
              variant="pill"
            />
          </SceneTransition>
        </Series.Sequence>

        {/* ========================================================
            SCENE 11 — FINAL PRODUCT SHOT (32–36s, 120 frames)
            ======================================================== */}
        <Series.Sequence durationInFrames={120}>
          <SceneTransition durationInFrames={120} transitionDuration={14} type="fade">
            <ProductHero businessName={businessName} />
          </SceneTransition>
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
