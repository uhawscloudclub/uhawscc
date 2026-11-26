/**
 * Past club events, newest first.
 *
 * Meetup's RSS feed only lists upcoming events, so this list is maintained by
 * hand. Source: the group's past-events page on Meetup
 * (https://www.meetup.com/aws-sbg-at-univ-of-houston/events/?type=past),
 * copied 2026-11-26. Add new events at the top after they happen.
 */

export type EventFormat = 'In person' | 'Online' | 'Hybrid';

export interface PastEvent {
  title: string;
  /** Houston calendar day, "YYYY-MM-DD". */
  date: string;
  format: EventFormat;
  /** Short place name, if the event had one. */
  place?: string;
  /** One or two sentences on what happened, in plain language. */
  summary: string;
  /** The event's own Meetup page. */
  meetupUrl: string;
}

const meetupEvent = (id: string) =>
  `https://www.meetup.com/aws-sbg-at-univ-of-houston/events/${id}/`;

export const PAST_EVENTS: readonly PastEvent[] = [
  {
    title: 'AWS Cloud Cup: Practice Exam Day',
    date: '2026-11-20',
    format: 'Online',
    place: 'Microsoft Teams',
    summary:
      'Final session of the Cloud Practitioner study cohort: everyone took the official CLF-C02 practice exam together, then signed up for exam voucher referrals.',
    meetupUrl: meetupEvent('317518911'),
  },
  {
    title: 'AWS & AI Security: Building an AI Penetration Testing Platform',
    date: '2026-10-12',
    format: 'Online',
    summary:
      'A live demo of an autonomous AI agent running a penetration test against an intentionally vulnerable banking app, powered by Amazon Bedrock.',
    meetupUrl: meetupEvent('316888052'),
  },
  {
    title: '2nd General Body Meeting',
    date: '2026-10-08',
    format: 'In person',
    place: 'UH Sugar Land, SAB 105A',
    summary: 'Games, open Q&A with officers, and a look at the rest of the semester.',
    meetupUrl: meetupEvent('316858774'),
  },
  {
    title: 'Zero to Certified with AWS',
    date: '2026-10-06',
    format: 'Hybrid',
    place: 'UH Sugar Land',
    summary:
      'With the Houston AWS User Group: a panel of AWS professionals, a certification roadmap, and a live AWS Student Rewards sign-up.',
    meetupUrl: meetupEvent('316792122'),
  },
  {
    title: 'AWS Career Spotlight: Day in the Life of a Cloud Support Engineer',
    date: '2026-10-01',
    format: 'Hybrid',
    place: 'UH Sugar Land',
    summary:
      'An AWS Cloud Support Engineer on the role, plus advice on LinkedIn, networking, and using AWS Builder Center.',
    meetupUrl: meetupEvent('316739897'),
  },
  {
    title: 'Intro to DevOps & CI/CD Fundamentals on AWS',
    date: '2026-09-30',
    format: 'Hybrid',
    place: 'AMG 104, UH Sugar Land',
    summary:
      'Built a working CI/CD pipeline with GitHub and AWS Amplify, then caught a leaked API key before it shipped. Led by Lance from the Houston AWS community.',
    meetupUrl: meetupEvent('316688453'),
  },
  {
    title: 'Git and GitHub Foundations Workshop',
    date: '2026-09-23',
    format: 'Hybrid',
    place: 'AMG 104, UH Sugar Land',
    summary:
      'Student-led: Git, GitHub, and Copilot from scratch, ending with a portfolio site live on GitHub Pages.',
    meetupUrl: meetupEvent('316558414'),
  },
  {
    title: 'Career Fair Prep: Resume Triage + Recruiter Gauntlet',
    date: '2026-09-14',
    format: 'In person',
    place: 'UH Sugar Land, SAB 105A',
    summary:
      'STAR-method storytelling, mock interviews, 30-second intros, and a portfolio site built with PartyRock.',
    meetupUrl: meetupEvent('316460129'),
  },
  {
    title: 'First General Body Meeting, Fall 2026',
    date: '2026-09-08',
    format: 'In person',
    place: 'UH Sugar Land, SAB 105',
    summary:
      "The fall roadmap, AWS student benefits, and an intro to Houston's AWS community with guest speaker Lancer Kind.",
    meetupUrl: meetupEvent('316375213'),
  },
  {
    title: 'Certification Prep Capstone & Voucher Kickoff',
    date: '2026-08-22',
    format: 'Online',
    summary:
      'Wrap-up of the six-week Cloud Practitioner and AI Practitioner prep program, with a live walkthrough of requesting a free exam voucher.',
    meetupUrl: meetupEvent('315814035'),
  },
  {
    title: 'AWS Community on Tour: Houston',
    date: '2026-04-20',
    format: 'In person',
    place: 'Amazon Houston office',
    summary:
      'Joined the Houston AWS User Group at the Amazon office for a hands-on agentic AI workshop with AWS Developer Advocates.',
    meetupUrl: meetupEvent('314139551'),
  },
  {
    title: 'Launch Day: Intro to Cloud Computing',
    date: '2026-04-02',
    format: 'In person',
    place: 'UH Sugar Land, SAB 1 Room 108',
    summary:
      'Our kickoff: AWS cloud basics, a live Amazon Q Developer demo, and how to get involved.',
    meetupUrl: meetupEvent('313899472'),
  },
];

/** "Fall 2026", "Summer 2026" or "Spring 2026" for a "YYYY-MM-DD" date. */
export function semesterOf(date: string): string {
  const [year, month] = date.split('-').map(Number);
  const term = month >= 8 ? 'Fall' : month >= 6 ? 'Summer' : 'Spring';
  return `${term} ${year}`;
}

/** Formats a "YYYY-MM-DD" Houston day as e.g. "Fri, Nov 20, 2026". */
export function formatEventDay(date: string): string {
  // Noon UTC keeps the calendar day stable in every US timezone.
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
