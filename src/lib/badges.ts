import { useSyncExternalStore } from 'react';
import type { PixelIconName } from '@/lib/sprites';
import { showPixelToast } from '@/lib/pixelToast';

/**
 * Hidden badges: small unlocks for exploring the site. Stored in this
 * browser only, under their own key (the learning-path progress key
 * `uh_aws_cc_progress_ccp_v1` is untouched). Locked badges show as "???"
 * with a hint, so finding them stays a surprise.
 */

export type BadgeId =
  | 'first-step'
  | 'path-complete'
  | 'pathfinder'
  | 'explorer'
  | 'mascot-friend'
  | 'card-collector'
  | 'lost-in-space';

export interface Badge {
  id: BadgeId;
  name: string;
  /** Shown once earned. */
  desc: string;
  /** Shown while locked. */
  hint: string;
  icon: PixelIconName;
}

export const BADGES: readonly Badge[] = [
  { id: 'first-step', name: 'First Step', desc: 'Checked off your first resource.', hint: 'Start the path.', icon: 'check' },
  { id: 'pathfinder', name: 'Pathfinder', desc: 'Found your first cert with the quiz.', hint: 'Answer five questions.', icon: 'arrowRight' },
  { id: 'explorer', name: 'Explorer', desc: 'Visited every page of the site.', hint: 'Look around.', icon: 'star' },
  { id: 'mascot-friend', name: 'Space Buddy', desc: 'Heard every one of the astronaut’s tips.', hint: 'Someone on the homepage has a lot to say.', icon: 'chat' },
  { id: 'card-collector', name: 'Card Collector', desc: 'Flipped every officer card.', hint: 'Meet the whole crew.', icon: 'refresh' },
  { id: 'lost-in-space', name: 'Lost in Space', desc: 'Found the page that does not exist.', hint: 'Go somewhere that is not there.', icon: 'alert' },
  { id: 'path-complete', name: 'Exam Ready', desc: 'Finished the whole Cloud Practitioner path.', hint: 'Clear every level.', icon: 'calendar' },
];

const STORAGE_KEY = 'uh_aws_sbg_badges_v1';
const PAGES_KEY = 'uh_aws_sbg_pages_v1';
/** Pages that count toward Explorer. */
export const EXPLORER_PAGES = ['/', '/events', '/learn', '/community', '/contact'] as const;

const VALID = new Set<string>(BADGES.map((b) => b.id));

function readList(key: string): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeList(key: string, list: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Private mode or storage off: badges just do not persist.
  }
}

let earned: BadgeId[] | null = null;
const listeners = new Set<() => void>();

function current(): BadgeId[] {
  if (earned === null) earned = readList(STORAGE_KEY).filter((id): id is BadgeId => VALID.has(id));
  return earned;
}

/** Unlock a badge once; notifies the toast. No-op if already earned. */
export function unlockBadge(id: BadgeId): void {
  if (current().includes(id)) return;
  earned = [...current(), id];
  writeList(STORAGE_KEY, earned);
  listeners.forEach((l) => l());
  const badge = BADGES.find((b) => b.id === id);
  if (badge) showPixelToast({ kicker: 'Badge unlocked', title: badge.name, body: badge.desc, icon: badge.icon });
}

/** Record a page visit; unlocks Explorer once every page has been seen. */
export function recordPageVisit(pathname: string): void {
  if (!(EXPLORER_PAGES as readonly string[]).includes(pathname)) return;
  const seen = readList(PAGES_KEY);
  if (!seen.includes(pathname)) {
    seen.push(pathname);
    writeList(PAGES_KEY, seen);
  }
  if (EXPLORER_PAGES.every((p) => seen.includes(p))) unlockBadge('explorer');
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Earned badge ids, live across the app. */
export function useBadges(): BadgeId[] {
  return useSyncExternalStore(subscribe, current, () => []);
}

/** Test helper: forget the in-memory cache so storage is re-read. */
export function resetBadgeCacheForTests(): void {
  earned = null;
}
