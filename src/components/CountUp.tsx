import { useEffect, useRef, useState } from 'react';

/**
 * A number that counts up from 0 in stepped ticks the first time it scrolls
 * into view ("154", "4.9"). Screen readers always get the final value (the
 * ticking copy is aria-hidden), and reduced motion or no IntersectionObserver
 * shows the final value straight away.
 */
const DURATION_MS = 900;
const TICKS = 18;

const CountUp = ({ value, className = '' }: { value: string; className?: string }) => {
  const target = Number(value);
  const decimals = value.includes('.') ? value.split('.')[1].length : 0;
  const canAnimate =
    Number.isFinite(target) &&
    typeof window !== 'undefined' &&
    typeof IntersectionObserver !== 'undefined' &&
    !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const [shown, setShown] = useState(canAnimate ? (0).toFixed(decimals) : value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!canAnimate || !ref.current) return;
    let timer = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      let tick = 0;
      timer = window.setInterval(() => {
        tick += 1;
        if (tick >= TICKS) {
          setShown(value);
          window.clearInterval(timer);
          return;
        }
        // Ease out: fast at first, slowing toward the target.
        const t = 1 - Math.pow(1 - tick / TICKS, 3);
        setShown((target * t).toFixed(decimals));
      }, DURATION_MS / TICKS);
    });
    io.observe(ref.current);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [canAnimate, value, target, decimals]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true" className="tabular-nums">{shown}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
};

export default CountUp;
