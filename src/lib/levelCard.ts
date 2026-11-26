import { ICONS, MASCOT_PALETTE, MASCOT_SPRITE, type PixelIconName } from '@/lib/sprites';

/**
 * Draws the shareable "level card" (1080×1080 PNG) on a canvas: level,
 * XP bar, resources done and badges earned, in the site's pixel style.
 * Everything is drawn from the same sprite grids as the site, and the
 * result is a data: URL (already allowed by the CSP's img-src).
 */

export interface LevelCardData {
  levelLabel: string;      // "Level 3 of 5" or "Path complete"
  levelTitle: string;      // e.g. "Learn the Fundamentals"
  done: number;
  total: number;
  badges: PixelIconName[]; // icons of earned badges
  badgeTotal: number;
}

const SIZE = 1080;
const C = {
  orbit: '#2B2072',
  hull: '#3A2D8F',
  hullDark: '#241a63',
  starlight: '#F6F3FF',
  dust: '#D4CCF8',
  chip: '#AD5CFF',
  beacon: '#FFD34D',
  beaconInk: '#1d1550',
};

function drawGrid(ctx: CanvasRenderingContext2D, grid: readonly string[], x: number, y: number, px: number, colorFor: (ch: string) => string | undefined) {
  grid.forEach((row, gy) => {
    [...row].forEach((ch, gx) => {
      const color = colorFor(ch);
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(x + gx * px, y + gy * px, px, px);
    });
  });
}

/** A notched pixel panel: a rectangle with its four corner pixels cut. */
function panel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, edge: string, b = 6) {
  ctx.fillStyle = edge;
  ctx.fillRect(x + b, y, w - 2 * b, h);
  ctx.fillRect(x, y + b, w, h - 2 * b);
  ctx.fillStyle = fill;
  ctx.fillRect(x + b, y + b, w - 2 * b, h - 2 * b);
}

export async function drawLevelCard(canvas: HTMLCanvasElement, data: LevelCardData): Promise<string> {
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');

  // Make sure the pixel display font is ready before drawing text.
  try {
    await document.fonts?.load('96px "Jersey 10"');
  } catch {
    // Falls back to the system font; the card still works.
  }
  const display = '"Jersey 10", "Figtree", system-ui, sans-serif';
  const body = '"Figtree", system-ui, sans-serif';

  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = C.orbit;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Fixed starfield (same every time, so the card is stable).
  const stars = [[36, 40], [260, 140], [420, 60], [610, 120], [780, 50], [990, 160], [940, 330], [28, 480], [1010, 560], [40, 800], [1000, 900], [520, 1010]];
  ctx.fillStyle = '#fff8d6';
  stars.forEach(([sx, sy], i) => ctx.fillRect(sx, sy, i % 3 ? 6 : 9, i % 3 ? 6 : 9));

  // Header: club name.
  ctx.fillStyle = C.dust;
  ctx.font = `600 34px ${body}`;
  ctx.textBaseline = 'top';
  ctx.fillText('AWS Student Builder Group · University of Houston', 72, 72);

  // Mascot, top right.
  drawGrid(ctx, MASCOT_SPRITE, 820, 150, 12, (ch) => MASCOT_PALETTE[ch]);

  // Level.
  ctx.fillStyle = C.beacon;
  // Shrink the headline until it clears the mascot.
  let headline = 160;
  ctx.font = `${headline}px ${display}`;
  while (headline > 80 && ctx.measureText(data.levelLabel.toUpperCase()).width > 730) {
    headline -= 8;
    ctx.font = `${headline}px ${display}`;
  }
  ctx.fillText(data.levelLabel.toUpperCase(), 66, 170 + (160 - headline) / 2);
  ctx.fillStyle = C.starlight;
  ctx.font = `700 48px ${body}`;
  ctx.fillText('Cloud Practitioner path', 72, 350);
  ctx.fillStyle = C.dust;
  ctx.font = `500 38px ${body}`;
  ctx.fillText(data.levelTitle, 72, 414);

  // XP bar: one block per resource.
  const barX = 72, barY = 520, barW = SIZE - 144, barH = 72, gap = 10;
  panel(ctx, barX, barY, barW, barH, C.hullDark, '#160f44');
  const inner = barW - 24;
  const block = (inner - gap * (data.total - 1)) / data.total;
  for (let i = 0; i < data.total; i++) {
    const bx = barX + 12 + i * (block + gap);
    ctx.fillStyle = i < data.done ? C.beacon : C.hull;
    ctx.fillRect(Math.round(bx), barY + 12, Math.floor(block), barH - 24);
  }
  ctx.fillStyle = C.starlight;
  ctx.font = `700 40px ${body}`;
  ctx.fillText(`${data.done} / ${data.total} resources`, 72, 616);

  // Badges.
  ctx.fillStyle = C.starlight;
  ctx.font = `72px ${display}`;
  ctx.fillText(`BADGES ${data.badges.length} / ${data.badgeTotal}`, 72, 720);
  data.badges.forEach((icon, i) => {
    const x = 72 + i * 132;
    panel(ctx, x, 810, 112, 112, C.beacon, C.beaconInk);
    drawGrid(ctx, ICONS[icon], x + 20, 830, 8, (ch) => (ch === '#' ? C.beaconInk : undefined));
  });
  if (data.badges.length === 0) {
    ctx.fillStyle = C.dust;
    ctx.font = `500 36px ${body}`;
    ctx.fillText('None yet. They are hidden around the site.', 72, 820);
  }

  // Footer.
  ctx.fillStyle = C.chip;
  ctx.fillRect(0, SIZE - 24, SIZE, 24);

  return canvas.toDataURL('image/png');
}

/** data: URL → File, for the Web Share API. */
export function dataUrlToFile(dataUrl: string, name: string): File {
  const [head, b64] = dataUrl.split(',');
  const mime = /data:([^;]+)/.exec(head)?.[1] ?? 'image/png';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], name, { type: mime });
}
