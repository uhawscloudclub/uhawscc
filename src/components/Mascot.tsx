/**
 * The club mascot: an original pixel astronaut. The visor is the logo's chip
 * violet and the chest badge is a tiny chip, tying it to the club logo.
 *
 * Drawn from a character grid so it stays crisp at any whole-number scale
 * (shape-rendering="crispEdges"). Decorative by default: pass `label` only
 * where the mascot itself carries meaning.
 */

import { MASCOT_PALETTE as PALETTE, MASCOT_SPRITE as SPRITE } from '@/lib/sprites';

const Mascot = ({
  size = 128,
  label,
  className = '',
}: {
  /** Rendered width in px; height keeps the 16:18 grid ratio. */
  size?: number;
  /** Accessible name. Omit for decorative use (hidden from screen readers). */
  label?: string;
  className?: string;
}) => {
  const rects: JSX.Element[] = [];
  SPRITE.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      const fill = PALETTE[cell];
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />);
    });
  });
  return (
    <svg
      viewBox="0 0 16 18"
      width={size}
      height={(size * 18) / 16}
      shapeRendering="crispEdges"
      className={className}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true, focusable: false })}
    >
      {rects}
    </svg>
  );
};

export default Mascot;
