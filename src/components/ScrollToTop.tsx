import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// How long to keep looking for a #fragment target. Routes are lazy-loaded, so
// the section may not exist yet on the first frame after navigation.
const HASH_WAIT_MS = 2000;

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    // Braced bodies throughout, no implicit returns: newer Chrome versions have
    // window.scrollTo return a Promise instead of undefined. An implicit-return
    // arrow function here would hand that Promise to React as the effect's
    // cleanup ("destroy") function; React stores it and unconditionally calls
    // it as a function the next time this effect's cleanup runs (i.e. on every
    // route change), which throws "TypeError: <x> is not a function" and
    // crashes to the error boundary on every single navigation.
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    // "/community#team" etc.: scroll to the section once it has rendered.
    const id = decodeURIComponent(hash.slice(1));
    const started = performance.now();
    let frame = 0;
    const tryScroll = () => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView();
        return;
      }
      if (performance.now() - started < HASH_WAIT_MS) {
        frame = requestAnimationFrame(tryScroll);
      }
    };
    tryScroll();
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [pathname, hash]);
  return null;
};

export default ScrollToTop;
