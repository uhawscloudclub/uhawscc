/**
 * Event date rules shared by the server (/api/events) and the browser
 * (Events page), so both decide "is this event still upcoming?" the same way.
 *
 * All comparisons use the Houston calendar day (America/Chicago), not UTC:
 * an event happening today in Houston stays "upcoming" until local midnight,
 * even though UTC has already rolled over to tomorrow by 6–7 PM local time.
 *
 * Plain JS (with eventDates.d.ts beside it) so server.js can import it
 * without a build step and the TypeScript app gets typed imports.
 */

export const HOUSTON_TZ = "America/Chicago";

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const houstonDayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: HOUSTON_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "YYYY-MM-DD" for the Houston calendar day of `date`, or null if invalid. */
export function houstonDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return houstonDayFormatter.format(d);
}

/** True when `rawDate` is a parseable date string. */
export function hasValidEventDate(rawDate) {
  return typeof rawDate === "string" && rawDate.length > 0 && houstonDateKey(rawDate) !== null;
}

/**
 * Whether an event should be shown as upcoming at `now`.
 *  - Event day (Houston) is today or later → upcoming.
 *  - Event day is before today → past.
 *  - Missing or invalid date → upcoming. Meetup's RSS only lists upcoming
 *    events, so an undated item is kept and shown with "date on Meetup".
 */
export function isUpcomingEvent(event, now = new Date()) {
  if (!event || !hasValidEventDate(event.rawDate)) return true;
  const today = houstonDateKey(now);
  if (!today) return true;
  return houstonDateKey(event.rawDate) >= today;
}

/** Returns a copy of `events` with `status` recomputed from the date at `now`. */
export function withComputedStatus(events, now = new Date()) {
  if (!Array.isArray(events)) return events;
  return events.map((event) => ({
    ...event,
    status: isUpcomingEvent(event, now) ? "upcoming" : "past",
  }));
}

const DAY_MS = 24 * 60 * 60 * 1000;
/** A year-less date more than this far behind today is read as next year. */
const YEAR_ROLLOVER_DAYS = 180;

/**
 * Builds an event date from a month name, a day and an optional year, pinned to
 * noon US Central (17:00 UTC) so the Houston calendar day never shifts.
 * With no year: assume the current Houston year, unless that would put the
 * event more than ~6 months in the past, in which case it's next year
 * (e.g. "January 15" read in late November is next January).
 * Returns null for an unknown month or an impossible day (e.g. February 31).
 */
export function buildEventDate(monthName, day, year, now = new Date()) {
  const month = MONTHS.indexOf(String(monthName).toLowerCase());
  const dayNum = Number(day);
  if (month < 0 || !Number.isInteger(dayNum) || dayNum < 1 || dayNum > 31) return null;

  const make = (y) => {
    const d = new Date(Date.UTC(y, month, dayNum, 17, 0, 0));
    return d.getUTCMonth() === month && d.getUTCDate() === dayNum ? d : null;
  };

  if (year) return make(Number(year));

  const todayKey = houstonDateKey(now);
  if (!todayKey) return null;
  const currentYear = Number(todayKey.slice(0, 4));
  const candidate = make(currentYear);
  if (!candidate) return null;

  const todayNoon = new Date(`${todayKey}T17:00:00.000Z`);
  const daysBehind = (todayNoon.getTime() - candidate.getTime()) / DAY_MS;
  return daysBehind > YEAR_ROLLOVER_DAYS ? make(currentYear + 1) : candidate;
}
