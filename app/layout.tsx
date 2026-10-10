import './globals.css';
import type { Metadata, Viewport } from 'next';
import { BRAND } from '@/lib/brand';
import { appUrl } from '@/lib/config';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: `${BRAND.name} | Elite Flight Crew Training & Recruitment`,
    template: `%s | ${BRAND.name}`,
  },
  description:
    'Flight crew training and recruitment for cabin crew, pilots and ground operations professionals, aligned to EASA, FAA and ICAO safety standards.',
  applicationName: BRAND.name,
  keywords: ['aviation academy', 'flight training', 'cabin crew training', 'pilot recruitment', 'EASA', 'FAA', 'ICAO'],
  openGraph: {
    type: 'website',
    siteName: BRAND.name,
    title: `${BRAND.name} | Elite Flight Crew Training & Recruitment`,
    description:
      'Train for a career in aviation — cabin crew, pilots and ground operations — with a curriculum aligned to EASA, FAA and ICAO standards.',
    url: '/',
    images: [{ url: '/media/cockpit-poster.jpg', width: 1200, height: 630, alt: `${BRAND.name} flight deck training` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} | Elite Flight Crew Training & Recruitment`,
    description:
      'Train for a career in aviation — cabin crew, pilots and ground operations — aligned to EASA, FAA and ICAO standards.',
    images: ['/media/cockpit-poster.jpg'],
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0a2342' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
