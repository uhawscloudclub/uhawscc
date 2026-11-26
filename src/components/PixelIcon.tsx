/**
 * The site's pixel icon set: original 9×9 sprites drawn from character grids
 * (like the mascot), filled with currentColor so they take the text colour of
 * the link or button they sit in. Decorative by default (hidden from screen
 * readers): the surrounding text or aria-label carries the meaning.
 *
 * Brand marks (Discord, Instagram, LinkedIn) are deliberately not redrawn
 * here; those stay as the official logos.
 */

const ICONS = {
  // Opens in a new tab: box with an arrow leaving it.
  external: [
    '....#####',
    '......###',
    '.....#.##',
    '####.#..#',
    '#...#....',
    '#........',
    '#.......#',
    '#.......#',
    '#########',
  ],
  arrowRight: [
    '.........',
    '.....#...',
    '.....##..',
    '#########',
    '#########',
    '.....##..',
    '.....#...',
    '.........',
    '.........',
  ],
  arrowLeft: [
    '.........',
    '...#.....',
    '..##.....',
    '#########',
    '#########',
    '..##.....',
    '...#.....',
    '.........',
    '.........',
  ],
  calendar: [
    '.#.....#.',
    '#########',
    '#########',
    '#.......#',
    '#.##.##.#',
    '#.......#',
    '#.##.##.#',
    '#.......#',
    '#########',
  ],
  check: [
    '.........',
    '........#',
    '.......##',
    '#.....##.',
    '##...##..',
    '.##.##...',
    '..###....',
    '...#.....',
    '.........',
  ],
  close: [
    '##.....##',
    '###...###',
    '.###.###.',
    '..#####..',
    '...###...',
    '..#####..',
    '.###.###.',
    '###...###',
    '##.....##',
  ],
  menu: [
    '.........',
    '#########',
    '#########',
    '.........',
    '#########',
    '#########',
    '.........',
    '#########',
    '#########',
  ],
  mail: [
    '#########',
    '##.....##',
    '#.#...#.#',
    '#..#.#..#',
    '#...#...#',
    '#.......#',
    '#.......#',
    '#.......#',
    '#########',
  ],
  alert: [
    '...###...',
    '...###...',
    '..#####..',
    '..##.##..',
    '.###.###.',
    '.#######.',
    '####.####',
    '#########',
    '#########',
  ],
  chat: [
    '#########',
    '#.......#',
    '#.##.##.#',
    '#.......#',
    '#.......#',
    '#########',
    '.##......',
    '.#.......',
    '.........',
  ],
  refresh: [
    '..####.#.',
    '.#....##.',
    '#....###.',
    '#........',
    '#.......#',
    '........#',
    '.###....#',
    '.##....#.',
    '.#.####..',
  ],
} as const;

export type PixelIconName = keyof typeof ICONS;

const PixelIcon = ({
  name,
  size = 16,
  className = '',
  label,
}: {
  name: PixelIconName;
  /** Rendered size in px; multiples of 9 are the crispest, 16–18 is typical. */
  size?: number;
  className?: string;
  /** Accessible name, only when the icon stands alone with no text. */
  label?: string;
}) => {
  const rects: JSX.Element[] = [];
  ICONS[name].forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === '#') rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
    });
  });
  return (
    <svg
      viewBox="0 0 9 9"
      width={size}
      height={size}
      fill="currentColor"
      shapeRendering="crispEdges"
      className={`shrink-0 ${className}`}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true, focusable: false })}
    >
      {rects}
    </svg>
  );
};

export default PixelIcon;
