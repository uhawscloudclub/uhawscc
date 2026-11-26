import { ICONS, MASCOT_PALETTE, MASCOT_SPRITE } from '@/lib/sprites';

/**
 * The Star Catcher game engine (404 page): plain JS, no React, so the
 * per-frame loop can mutate its own state freely. The component creates one
 * engine per canvas and listens for score/lives/game-over callbacks.
 */

export const GAME_W = 160;
export const GAME_H = 120;
const PLAYER_W = 16;
const PLAYER_H = 18;
const SPEED = 110;

type Item = { x: number; y: number; kind: 'star' | 'bug'; vy: number };

export interface GameCallbacks {
  onScore: (score: number) => void;
  onLives: (lives: number) => void;
  onOver: (score: number) => void;
  onCatch?: () => void;
  onHurt?: () => void;
}

function drawSprite(ctx: CanvasRenderingContext2D, grid: readonly string[], x: number, y: number, color: (ch: string) => string | undefined) {
  grid.forEach((row, gy) =>
    [...row].forEach((ch, gx) => {
      const c = color(ch);
      if (!c) return;
      ctx.fillStyle = c;
      ctx.fillRect(Math.round(x) + gx, Math.round(y) + gy, 1, 1);
    }),
  );
}

export function createStarCatcher(canvas: HTMLCanvasElement, cb: GameCallbacks, random: () => number = Math.random) {
  const ctx = canvas.getContext('2d');
  let x = (GAME_W - PLAYER_W) / 2;
  let target: number | null = null;
  let dir = 0;
  let items: Item[] = [];
  let spawnIn = 0;
  let score = 0;
  let lives = 3;
  let last = 0;
  let frame = 0;
  let running = false;

  const draw = () => {
    if (!ctx) return;
    ctx.fillStyle = '#241a63';
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    ctx.fillStyle = '#4b3fa6';
    for (let i = 0; i < 24; i++) ctx.fillRect((i * 37) % GAME_W, (i * 53) % (GAME_H - 30), 1, 1);
    ctx.fillStyle = '#3A2D8F';
    ctx.fillRect(0, GAME_H - 4, GAME_W, 4);
    for (const it of items) {
      drawSprite(ctx, ICONS[it.kind === 'star' ? 'star' : 'alert'], it.x, it.y, (ch) =>
        ch === '#' ? (it.kind === 'star' ? '#FFD34D' : '#ff6b8a') : undefined,
      );
    }
    drawSprite(ctx, MASCOT_SPRITE, x, GAME_H - 4 - PLAYER_H, (ch) => MASCOT_PALETTE[ch]);
  };

  /** Advance the game by dt seconds (exported via the engine for tests). */
  const step = (dt: number) => {
    if (target !== null) {
      const d = target - (x + PLAYER_W / 2);
      x += Math.sign(d) * Math.min(Math.abs(d), SPEED * dt);
    } else {
      x += dir * SPEED * dt;
    }
    x = Math.max(0, Math.min(GAME_W - PLAYER_W, x));

    spawnIn -= dt;
    if (spawnIn <= 0) {
      const level = Math.min(score / 10, 4);
      items.push({
        x: random() * (GAME_W - 9),
        y: -9,
        kind: random() < 0.28 + level * 0.04 ? 'bug' : 'star',
        vy: 34 + level * 12 + random() * 14,
      });
      spawnIn = Math.max(0.35, 0.9 - level * 0.12);
    }

    const py = GAME_H - 4 - PLAYER_H;
    const kept: Item[] = [];
    for (const it of items) {
      it.y += it.vy * dt;
      const hit = it.y + 9 >= py + 2 && it.y <= py + PLAYER_H && it.x + 9 >= x + 2 && it.x <= x + PLAYER_W - 2;
      if (hit) {
        if (it.kind === 'star') {
          score += 1;
          cb.onScore(score);
          cb.onCatch?.();
        } else {
          lives -= 1;
          cb.onLives(lives);
          cb.onHurt?.();
        }
        continue;
      }
      if (it.y < GAME_H) kept.push(it);
    }
    items = kept;
    if (lives <= 0) stop(true);
  };

  const loop = (t: number) => {
    if (!running) return;
    const dt = Math.min(0.05, (t - (last || t)) / 1000);
    last = t;
    step(dt);
    draw();
    if (running) frame = requestAnimationFrame(loop);
  };

  function stop(over = false) {
    running = false;
    cancelAnimationFrame(frame);
    if (over) cb.onOver(score);
  }

  return {
    start() {
      x = (GAME_W - PLAYER_W) / 2;
      target = null;
      dir = 0;
      items = [];
      spawnIn = 0.4;
      score = 0;
      lives = 3;
      last = 0;
      running = true;
      cb.onScore(0);
      cb.onLives(3);
      frame = requestAnimationFrame(loop);
    },
    stop: () => stop(false),
    draw,
    step,
    setDir(d: number) {
      target = null;
      dir = d;
    },
    releaseDir(d: number) {
      if (dir === d) dir = 0;
    },
    setTarget(t: number) {
      target = t;
    },
    get running() {
      return running;
    },
    /** For tests: drop an item at a spot. */
    spawn(item: Item) {
      items.push(item);
    },
    get playerX() {
      return x;
    },
  };
}

export type StarCatcherEngine = ReturnType<typeof createStarCatcher>;
