// Airline partners Meridian places graduates into. Rendered on the home page
// as a text list under the partner wall. Regulator frameworks (EASA / FAA /
// ICAO) are named in the section heading, not here.
export const fallbackPartners = [
  { id: 1, name: 'British Airways', slug: 'british-airways' },
  { id: 2, name: 'Virgin Atlantic', slug: 'virgin-atlantic' },
  { id: 3, name: 'Air France', slug: 'air-france' },
  { id: 4, name: 'Lufthansa', slug: 'lufthansa' },
  { id: 5, name: 'KLM', slug: 'klm' },
];

export type Program = {
  id: number;
  slug: string;
  name: string;
  summary: string;
  min_hours: string | null;
  typical_hours: string | null;
  price_low: number | null;
  price_high: number | null;
  price_note: string | null;
  featured: boolean;
  sort: number;
};
export type Rate = { id: number; label: string; low: number; high: number; unit: string; sort: number };
export type Faq = { id: number; question: string; answer: string; sort: number };
export type TrainingStep = { id: number; title: string; body: string; sort: number };

// Artwork per program slug. Slugs come from the programs table.
export const programMedia: Record<string, { img: string; chip: string }> = {
  private: { img: '/media/plane-clouds.jpg', chip: 'Flight Deck' },
  instrument: { img: '/media/cockpit-poster.jpg', chip: 'Flight Deck' },
  commercial: { img: '/media/cockpit-poster.jpg', chip: 'Flight Deck' },
  career: { img: '/media/plane-clouds.jpg', chip: 'Flight Deck' },
  'cabin-crew': { img: '/media/climb-poster.jpg', chip: 'Cabin Crew' },
  'ground-ops': { img: '/media/city-plane.jpg', chip: 'Ground Ops' },
};
export const defaultProgramMedia = { img: '/media/plane-clouds.jpg', chip: 'Aviation' };

// Mirrors db/seed.sql so every page renders before a database is connected.
export const fallbackPrograms: Program[] = [
  { id: 1, slug: 'private', name: 'Private pilot', summary: 'Your first certificate. Fly for personal travel and build the base for every rating after it.', min_hours: '40 (Part 61) or 35 (Part 141)', typical_hours: '50 to 70 hours', price_low: 12000, price_high: 20000, price_note: 'Typical U.S. range. Intensive academy programs often run higher.', featured: false, sort: 1 },
  { id: 2, slug: 'instrument', name: 'Instrument rating', summary: 'Fly in cloud and low visibility. Required for most professional flying.', min_hours: '40 hours of instrument time', typical_hours: '40 to 55 hours', price_low: 21000, price_high: 26000, price_note: 'Full-time program range.', featured: true, sort: 2 },
  { id: 3, slug: 'commercial', name: 'Commercial certificate', summary: 'Fly for pay. Includes complex aircraft and advanced maneuvers.', min_hours: '250 total flight hours', typical_hours: '250 total hours', price_low: 25000, price_high: 29000, price_note: 'Full-time program range.', featured: false, sort: 3 },
  { id: 4, slug: 'career', name: 'Zero to airline career', summary: 'Every certificate and rating an airline requires, in one structured path.', min_hours: '1,500 hours for airline transport', typical_hours: '1,500 total hours', price_low: 80000, price_high: 130000, price_note: 'Typical range for a complete professional path, often more.', featured: false, sort: 4 },
  { id: 5, slug: 'cabin-crew', name: 'Cabin crew', summary: 'Safety, service and emergency procedures for airline cabin crew, including aircraft-specific training.', min_hours: 'No flight hours required', typical_hours: '8 weeks', price_low: null, price_high: null, price_note: 'Academy cohort pricing on request.', featured: false, sort: 5 },
  { id: 6, slug: 'ground-ops', name: 'Ground operations', summary: 'Ramp safety, aircraft marshalling, baggage handling and ground support equipment.', min_hours: 'No flight hours required', typical_hours: '6 weeks', price_low: null, price_high: null, price_note: 'Academy cohort pricing on request.', featured: false, sort: 6 },
];

export const fallbackRates: Rate[] = [
  { id: 1, label: 'Single-engine aircraft rental', low: 130, high: 220, unit: 'per hour', sort: 1 },
  { id: 2, label: 'Multi-engine aircraft rental', low: 275, high: 375, unit: 'per hour', sort: 2 },
  { id: 3, label: 'Flight instructor', low: 50, high: 100, unit: 'per hour', sort: 3 },
  { id: 4, label: 'Simulator session', low: 60, high: 120, unit: 'per hour', sort: 4 },
  { id: 5, label: 'Ground school', low: 300, high: 1500, unit: 'per course', sort: 5 },
  { id: 6, label: 'Medical certificate', low: 100, high: 225, unit: 'one time', sort: 6 },
  { id: 7, label: 'FAA written test', low: 175, high: 200, unit: 'one time', sort: 7 },
  { id: 8, label: 'Checkride examiner', low: 500, high: 900, unit: 'one time', sort: 8 },
];

export const fallbackFaqs: Faq[] = [
  { id: 1, question: 'Do I need flying experience?', answer: 'No. Most students begin with zero hours.', sort: 1 },
  { id: 2, question: 'How many hours will I need?', answer: 'The FAA minimum for a private certificate is 40 hours (35 at a Part 141 school). Most students need 50 to 70.', sort: 2 },
  { id: 3, question: 'What does training really cost?', answer: 'Aircraft rental is the largest cost, followed by instructor time. Ask us for a written estimate before you start.', sort: 3 },
  { id: 4, question: 'Do I need a medical certificate?', answer: 'Yes. Book an FAA medical exam early so nothing delays your first solo.', sort: 4 },
  { id: 5, question: 'Can I train around a full-time job?', answer: 'Yes. Flying two to three times a week is the most efficient schedule for most working students.', sort: 5 },
];

export const fallbackTrainingSteps: TrainingStep[] = [
  { id: 1, title: 'Discovery flight', body: 'Fly with an instructor, tour the fleet and agree a training plan and budget.', sort: 1 },
  { id: 2, title: 'Ground school and first solo', body: 'Study weather, navigation and regulations while building toward your first solo flight.', sort: 2 },
  { id: 3, title: 'Cross-country and night', body: 'Plan flights between airports and complete your night and solo cross-country requirements.', sort: 3 },
  { id: 4, title: 'Checkride', body: 'Complete a mock checkride, then fly your practical test with an FAA examiner.', sort: 4 },
];

export const processSteps = [
  { title: 'Enquiry and eligibility', body: 'Tell us which track you are aiming for and we confirm entry requirements, funding and the next start date.' },
  { title: 'Assessment and enrolment', body: 'Complete an aptitude assessment and a short interview, then secure your place on the next cohort.' },
  { title: 'Ground school and flying', body: 'Study the theory and build your hours in the simulator and on the aircraft with active instructors.' },
  { title: 'Qualification and placement', body: 'Pass your final competency check, then move into airline interviews with our placement team.' },
];
