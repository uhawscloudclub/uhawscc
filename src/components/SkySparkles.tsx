/**
 * Twinkling pixel stars and an occasional shooting star over the hero sky.
 * Purely decorative (aria-hidden, no pointer events). The motion lives in CSS
 * behind prefers-reduced-motion: no-preference, so reduced-motion visitors
 * get the static sky. Stars sit in the top band and right edge, away from
 * the hero text.
 */
const STARS: Array<{ top: string; left: string; size: 2 | 3; delay: string }> = [
  { top: '6%', left: '8%', size: 2, delay: '0s' },
  { top: '4%', left: '31%', size: 3, delay: '1.1s' },
  { top: '10%', left: '47%', size: 2, delay: '2.3s' },
  { top: '3%', left: '62%', size: 2, delay: '0.6s' },
  { top: '12%', left: '74%', size: 3, delay: '1.8s' },
  { top: '7%', left: '88%', size: 2, delay: '2.9s' },
  { top: '22%', left: '94%', size: 2, delay: '0.3s' },
  { top: '34%', left: '83%', size: 3, delay: '1.5s' },
  { top: '18%', left: '56%', size: 2, delay: '3.4s' },
];

const SkySparkles = () => (
  <div className="px-sparkles" aria-hidden="true">
    {STARS.map((s) => (
      <span
        key={`${s.top}-${s.left}`}
        className="px-star"
        style={{ top: s.top, left: s.left, width: s.size * 2, height: s.size * 2, animationDelay: s.delay }}
      />
    ))}
    <span className="px-shooting-star" />
  </div>
);

export default SkySparkles;
