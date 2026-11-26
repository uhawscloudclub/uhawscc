import { useEffect } from 'react';

/**
 * Cards "boot up" (a quick stepped flash and settle) as they scroll into
 * view, one after another down a grid. Works on any element matching
 * REVEAL_SELECTOR, including ones added later (e.g. "Show all").
 *
 * Content is never hidden unless the animation can run: the hiding class
 * (html.px-reveal-on) is only set when IntersectionObserver exists and the
 * visitor has not asked for reduced motion, and anything already on screen
 * when it is found is shown at once, with no animation and no flicker.
 */
export const REVEAL_SELECTOR = '.px-join-card, .px-event-card, .px-officer, .px-badge';
const STAGGER_MS = 70;

export function useRevealOnScroll(routeKey: string): void {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    root.classList.add('px-reveal-on');

    const io = new IntersectionObserver(
      (entries) => {
        let i = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.style.animationDelay = `${i++ * STAGGER_MS}ms`;
          el.classList.add('is-in', 'px-boot');
          // Drop the class when done so the finished animation stops pinning
          // transform (which would block the hover lift).
          const done = (e: AnimationEvent) => {
            if (e.target !== el) return;
            el.classList.remove('px-boot');
            el.style.animationDelay = '';
            el.removeEventListener('animationend', done);
          };
          el.addEventListener('animationend', done);
          io.unobserve(el);
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );

    const seen = new WeakSet<Element>();
    const track = (el: Element) => {
      if (seen.has(el)) return;
      seen.add(el);
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-in'); // already visible: show, don't animate
      } else {
        io.observe(el);
      }
    };
    const scan = () => document.querySelectorAll(REVEAL_SELECTOR).forEach(track);
    scan();
    // Cards that mount later (lazy routes, "Show all", flips) get tracked too.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      // Leave nothing hidden behind if this page unmounts.
      document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => el.classList.add('is-in'));
    };
  }, [routeKey]);
}
