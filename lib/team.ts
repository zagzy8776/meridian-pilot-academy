import { sql, hasDb } from '@/lib/db';

// Team members shown on the public /team page and managed from the admin
// dashboard. Reads always fall back to the curated list below so the page
// renders even before the database or the table exists.
export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  sort: number;
};

// Curated fallback so /team is never empty.
export const fallbackTeam: TeamMember[] = [
  {
    id: '1',
    name: 'Capt. James Whitfield',
    role: 'Director of Flight Training',
    bio: 'Former airline captain with 18,000 hours. Leads our flight-deck training standards and instructor team.',
    photo_url: null,
    sort: 1,
  },
  {
    id: '2',
    name: 'Elena Rossi',
    role: 'Head of Cabin Crew Training',
    bio: 'Ex-purser with 14 years of line experience. Designs and delivers our cabin crew safety and service curriculum.',
    photo_url: null,
    sort: 2,
  },
  {
    id: '3',
    name: 'Daniel Okoye',
    role: 'Head of Recruitment & Admissions',
    bio: 'Oversees candidate selection, compliance screening and airline placement partnerships.',
    photo_url: null,
    sort: 3,
  },
];

export async function getTeam(): Promise<TeamMember[]> {
  if (!hasDb) return fallbackTeam;
  try {
    // Timeout so a slow/paused database can't hang page rendering or the build.
    const rows: any = await Promise.race([
      sql`select id, name, role, bio, photo_url, sort from team_members order by sort, name`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('db timeout')), 4000)),
    ]);
    return rows?.length ? (rows as TeamMember[]) : fallbackTeam;
  } catch {
    return fallbackTeam;
  }
}
