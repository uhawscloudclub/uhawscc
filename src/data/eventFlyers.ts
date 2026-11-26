/**
 * Meetup flyers for past events, self-hosted (800×450 WebP) so the page
 * makes no third-party image requests and the CSP stays 'self'-only.
 * Files are named by Meetup event id: src/assets/events/<id>.webp.
 * To add one: save the event's Meetup image there under its id.
 */
const files = import.meta.glob<string>('../assets/events/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

const byId: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const id = /\/(\d+)\.webp$/.exec(path)?.[1];
  if (id) byId[id] = url;
}

/** The flyer URL for a Meetup event page URL, if we have one. */
export function flyerFor(meetupUrl: string): string | undefined {
  const id = /\/events\/(\d+)\/?$/.exec(meetupUrl)?.[1];
  return id ? byId[id] : undefined;
}
