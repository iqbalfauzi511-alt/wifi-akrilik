import { Composition } from 'remotion';
import { CobascanCustomerJourney } from './CobascanCustomerJourney';
import { CobascanIntro } from './CobascanIntro';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CobascanCustomerJourney"
        component={CobascanCustomerJourney}
        durationInFrames={1080}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          businessName: 'Kopi Senja Cafe',
          wifiSsid: 'KopiSenja_Guest',
          wifiPassword: 'kopisenja2024',
        }}
      />
      <Composition
        id="CobascanIntro"
        component={CobascanIntro}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
