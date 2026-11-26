import { EXTERNAL_LINKS } from '@/config/externalLinks';

/**
 * "Find your cloud path": five tap-to-answer questions that suggest a first
 * AWS certification. Questions and results approved by the club.
 *
 * Scoring is a simple tally: each answer adds points to one or more certs,
 * the highest total wins, and ties go to Cloud Practitioner (the safest
 * first step). Solutions Architect – Associate is never suggested to someone
 * who has not used AWS yet.
 */

export type CertId = 'ccp' | 'aip' | 'saa';

export interface QuizOption {
  id: string;
  label: string;
  points: Partial<Record<CertId, number>>;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
}

export const QUIZ: readonly QuizQuestion[] = [
  {
    id: 'experience',
    prompt: 'Have you used AWS before?',
    options: [
      { id: 'none', label: 'Never', points: { ccp: 3, aip: 1 } },
      { id: 'some', label: 'A little: a class or the console', points: { ccp: 1, aip: 1, saa: 1 } },
      { id: 'built', label: 'Yes, I have built things on it', points: { saa: 3 } },
    ],
  },
  {
    id: 'interest',
    prompt: 'What interests you most?',
    options: [
      { id: 'apps', label: 'Building apps', points: { saa: 2, ccp: 1 } },
      { id: 'ai', label: 'Data and AI', points: { aip: 3 } },
      { id: 'security', label: 'Security', points: { ccp: 2, saa: 1 } },
      { id: 'infra', label: 'Infrastructure', points: { saa: 2, ccp: 1 } },
    ],
  },
  {
    id: 'hours',
    prompt: 'How many hours a week can you study?',
    options: [
      { id: 'low', label: 'Under 3', points: { ccp: 2, aip: 1 } },
      { id: 'mid', label: '3 to 6', points: { ccp: 1, aip: 1, saa: 1 } },
      { id: 'high', label: '7 or more', points: { saa: 2 } },
    ],
  },
  {
    id: 'major',
    prompt: "What's your major?",
    options: [
      { id: 'cs', label: 'CS, CIS, or engineering', points: { saa: 1, ccp: 1 } },
      { id: 'data', label: 'Data science, math, or stats', points: { aip: 2 } },
      { id: 'business', label: 'Business', points: { ccp: 2, aip: 1 } },
      { id: 'other', label: 'Something else', points: { ccp: 2 } },
    ],
  },
  {
    id: 'goal',
    prompt: "What's your goal right now?",
    options: [
      { id: 'internship', label: 'Land an internship', points: { saa: 2, ccp: 1 } },
      { id: 'cert', label: 'Get certified', points: { ccp: 1, aip: 1, saa: 1 } },
      { id: 'explore', label: 'Just exploring', points: { ccp: 2, aip: 1 } },
    ],
  },
];

export interface QuizLink {
  label: string;
  href: string;
  /** Internal route (react-router Link) vs. external site. */
  internal?: boolean;
}

export interface CertResult {
  id: CertId;
  name: string;
  level: string;
  why: string;
  links: QuizLink[];
}

export const RESULTS: Record<CertId, CertResult> = {
  ccp: {
    id: 'ccp',
    name: 'AWS Certified Cloud Practitioner',
    level: 'Foundational',
    why: 'The best first cert: it covers what the cloud is and what AWS offers, and needs no technical background. Study with a group in the AWS Cloud Cup.',
    links: [
      { label: 'Start the path on this page', href: '#path', internal: true },
      { label: 'Find the next Cloud Cup on Events', href: '/events', internal: true },
      { label: 'Get student access in Builder Center', href: EXTERNAL_LINKS.builderCenterStudents },
    ],
  },
  aip: {
    id: 'aip',
    name: 'AWS Certified AI Practitioner',
    level: 'Foundational',
    why: 'Built for people curious about data and AI: how generative AI and machine learning work on AWS, without needing to code.',
    links: [
      { label: 'Find AI courses on Skill Builder', href: EXTERNAL_LINKS.skillBuilderHome },
      { label: 'Get student access in Builder Center', href: EXTERNAL_LINKS.builderCenterStudents },
      { label: 'Practice on the AWS Free Tier', href: EXTERNAL_LINKS.awsFreeTier },
    ],
  },
  saa: {
    id: 'saa',
    name: 'AWS Certified Solutions Architect – Associate',
    level: 'Associate',
    why: 'You already know your way around AWS. This one proves you can design real systems, and recruiters for cloud internships look for it.',
    links: [
      { label: 'Practice on the AWS Free Tier', href: EXTERNAL_LINKS.awsFreeTier },
      { label: 'Prep on Skill Builder', href: EXTERNAL_LINKS.skillBuilderHome },
      { label: 'Study with others in the AWS Cloud Cup', href: '/events', internal: true },
    ],
  },
};

const ORDER: CertId[] = ['ccp', 'aip', 'saa'];

/** answers: question id → option id. Returns the suggested cert. */
export function scoreQuiz(answers: Record<string, string>): CertId {
  const totals: Record<CertId, number> = { ccp: 0, aip: 0, saa: 0 };
  for (const q of QUIZ) {
    const opt = q.options.find((o) => o.id === answers[q.id]);
    if (!opt) continue;
    for (const id of ORDER) totals[id] += opt.points[id] ?? 0;
  }
  if (answers.experience === 'none') totals.saa = -Infinity;
  // Highest total wins; ORDER breaks ties toward the gentler cert.
  return ORDER.reduce((best, id) => (totals[id] > totals[best] ? id : best), 'ccp' as CertId);
}
