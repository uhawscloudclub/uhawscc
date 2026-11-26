import { houstonDateKey } from '../../server/eventDates.js';

/**
 * Countdown and add-to-calendar helpers for a Meetup event.
 *
 * The feed only gives us the event's *day* (rawDate is pinned to noon
 * Central), not its start time, so both helpers stay honest about that: the
 * countdown counts Houston calendar days ("In 3 days", "Today"), and the
 * calendar file is an all-day entry that points to Meetup for the time.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole Houston calendar days from `now` until the event day; null if invalid. */
export function daysUntilEvent(rawDate: string, now: Date = new Date()): number | null {
  const eventKey = houstonDateKey(rawDate);
  const todayKey = houstonDateKey(now);
  if (!eventKey || !todayKey) return null;
  // Both keys are YYYY-MM-DD; compare them as UTC midnights so DST never skews the count.
  return Math.round((Date.parse(eventKey) - Date.parse(todayKey)) / DAY_MS);
}

/** Short countdown label, or null for a past or invalid date. */
export function countdownLabel(rawDate: string, now: Date = new Date()): string | null {
  const days = daysUntilEvent(rawDate, now);
  if (days === null || days < 0) return null;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

/** RFC 5545 text escaping: backslash, semicolon, comma, newline. */
function icsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Fold lines longer than 75 octets, as the spec requires. */
function foldLine(line: string): string {
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    parts.push(rest.slice(0, 74));
    rest = ' ' + rest.slice(74);
  }
  parts.push(rest);
  return parts.join('\r\n');
}

export interface CalendarEvent {
  id: string;
  title: string;
  rawDate: string;
  link: string;
}

/** An all-day .ics entry for the event's Houston day, or null if the date is invalid. */
export function buildIcs(event: CalendarEvent, now: Date = new Date()): string | null {
  const dayKey = houstonDateKey(event.rawDate);
  if (!dayKey) return null;
  const start = dayKey.replace(/-/g, '');
  const end = new Date(Date.parse(dayKey) + DAY_MS).toISOString().slice(0, 10).replace(/-/g, '');
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const uid = `${start}-${event.id.replace(/[^A-Za-z0-9]/g, '').slice(-40) || 'event'}@sbg-uh`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AWS SBG at UH//Events//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${icsText(event.title)}`,
    `DESCRIPTION:${icsText(`Time, place and RSVP on Meetup: ${event.link}`)}`,
    `URL:${event.link}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/** A safe file name for the download, e.g. "intro-to-devops.ics". */
export function icsFileName(title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  return `${slug || 'event'}.ics`;
}
