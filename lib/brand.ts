// Single source of truth for the public brand name and legal identity.
// Every page, footer and metadata tag should read from here so the site never
// presents two different company names (a classic "not a real business" tell).
export const BRAND = {
  name: 'Meridian Aviation Academy',
  shortName: 'Meridian',
  tagline: 'Elite flight crew training & recruitment',
  legalEntity: 'Meridian Aviation Academy Ltd',
  registeredOffice: 'Communications House, 26 York Street, London, United Kingdom',
  companyNumber: 'Pending registration',
  email: 'admissions@meridianaviationacademy.com',
  privacyEmail: 'privacy@meridianaviationacademy.com',
  phone: '+44 (0)20 0000 0000',
  jurisdiction: 'England and Wales',
} as const;

export const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/refund-policy', label: 'Refund Policy' },
  { href: '/cookies', label: 'Cookie Policy' },
] as const;
