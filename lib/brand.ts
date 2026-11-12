// Single source of truth for the public brand name and legal identity.
// Every page, footer and metadata tag should read from here so the site never
// presents two different company names (a classic "not a real business" tell).
export const BRAND = {
  name: 'Meridian Aviation Academy',
  shortName: 'Meridian',
  tagline: 'Elite flight crew training & recruitment',
  legalEntity: 'Meridian Aviation Academy Ltd',
  registeredOffice: 'Communications House, 26 York Street, London, W1W 7AW, United Kingdom',
  // PLACEHOLDER — replace with the real Companies House number before launch.
  companyNumber: '16934827',
  email: 'admissions@meridianaviationacademy.com',
  privacyEmail: 'privacy@meridianaviationacademy.com',
  // PLACEHOLDER — replace with the real inbound number before launch.
  phone: '+44 (0)20 3917 4420',
  jurisdiction: 'England and Wales',
  // PLACEHOLDER — replace with the real VAT number (or drop the line if not registered).
  vatNumber: 'GB 471 2290 66',
} as const;

export const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/refund-policy', label: 'Refund Policy' },
  { href: '/cookies', label: 'Cookie Policy' },
] as const;

export const SCREENER = {
  name: 'Trustline Screening Ltd',
  checks: 'identity verification, right-to-work confirmation and background screening',
  turnaround: '2–4 business days from commission',
  url: 'https://trustline.example.com',
} as const;
