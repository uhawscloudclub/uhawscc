/**
 * Contact form helpers, kept out of the page module so it only exports a
 * component (React Fast Refresh).
 */

// Limits match /api/contact in server.js (name 100, email 254, subject 200,
// message 10–5000), so the server never rejects what the form accepted with
// a vague error. Subject is capped at 150 here because the chosen reason is
// prepended to it (see buildSubject).
export const LIMITS = { name: 100, email: 254, subject: 150, message: 5000 } as const;


// ── Why are you writing? ──────────────────────────────────────────────────────
// Optional. Only changes the email subject line (no API change), and for
// "Joining" points to the faster self-serve route first.
export const INTENTS = [
  { id: 'joining', label: 'Joining the club' },
  { id: 'events', label: 'Events or learning' },
  { id: 'partner', label: 'Speaking, sponsoring, or partnering' },
  { id: 'other', label: 'Something else' },
] as const;

export type IntentId = (typeof INTENTS)[number]['id'];

/** Message placeholder per quest, so the empty box hints at what helps us reply. */
export const MESSAGE_PLACEHOLDERS: Record<IntentId | '', string> = {
  '': 'Your message…',
  joining: 'Your major and year, and what you want to get out of the club…',
  events: 'Which event or topic, and what you would like to know…',
  partner: 'Your organization, what you have in mind, and rough timing…',
  other: 'Your message…',
};

export function buildSubject(intentId: IntentId | '', subject = ''): string {
  const intent = INTENTS.find((i) => i.id === intentId)?.label ?? '';
  const trimmed = subject.trim();
  if (intent && trimmed) return `${intent}: ${trimmed}`;
  return intent || trimmed;
}

