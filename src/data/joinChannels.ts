import { EXTERNAL_LINKS } from '@/config/externalLinks';
import type { PixelIconName } from '@/lib/sprites';

/**
 * Ways to get involved, in the order a new student should try them.
 * `purpose` says plainly what each place is for, so nobody has to guess
 * whether to check Meetup, Discord, or Instagram for a given thing.
 */
export interface JoinChannel {
  id: 'meetup' | 'interest-form' | 'discord' | 'instagram' | 'linkedin' | 'contact';
  name: string;
  purpose: string;
  /** Visible link text; starts with a verb. */
  action: string;
  href: string;
  /** In-site route (rendered with the router) vs. an external site. */
  internal?: boolean;
  /** Pixel icon on the card (generic art, not the brand's logo). */
  icon: PixelIconName;
}

export const JOIN_CHANNELS: readonly JoinChannel[] = [
  {
    id: 'meetup',
    icon: 'calendar',
    name: 'Meetup',
    purpose: 'Every event is posted here first. Join the group to get notified and RSVP.',
    action: 'Join on Meetup',
    href: EXTERNAL_LINKS.meetup,
  },
  {
    id: 'interest-form',
    icon: 'clipboard',
    name: 'Member interest form',
    purpose: 'Tell the officers who you are and what you want to learn, so we can keep you in the loop.',
    action: 'Fill out the form',
    href: EXTERNAL_LINKS.memberInterestForm,
  },
  {
    id: 'discord',
    icon: 'chat',
    name: 'Discord',
    purpose: 'Ask questions, find study partners, and chat between events.',
    action: 'Join the Discord',
    href: EXTERNAL_LINKS.discord,
  },
  {
    id: 'instagram',
    icon: 'camera',
    name: 'Instagram',
    purpose: 'Event photos and quick announcements.',
    action: 'Follow on Instagram',
    href: EXTERNAL_LINKS.instagram,
  },
  {
    id: 'linkedin',
    icon: 'briefcase',
    name: 'LinkedIn',
    purpose: 'Club updates you can share with your professional network.',
    action: 'Follow on LinkedIn',
    href: EXTERNAL_LINKS.linkedin,
  },
  {
    id: 'contact',
    icon: 'mail',
    name: 'Contact',
    purpose: "Something else, or a link above isn't working? Message the officers directly.",
    action: 'Contact us',
    href: '/contact',
    internal: true,
  },
];
