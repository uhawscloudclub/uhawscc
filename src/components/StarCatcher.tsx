import { useEffect, useRef, useState } from 'react';
import PixelIcon from '@/components/PixelIcon';
import { createStarCatcher, GAME_H, GAME_W, type StarCatcherEngine } from '@/lib/starCatcher';
import { playSfx } from '@/lib/sound';

/**
 * "Star Catcher", the 404 page mini-game: move the astronaut to catch falling
 * stars and dodge bugs. Three lives; it speeds up as you score. Starts only
 * when the visitor presses Play (no autoplay), pauses when the tab is hidden.
 * The loop itself lives in src/lib/starCatcher.ts.
 *
 * Controls: arrow keys or A/D on the focused game, drag/tap on the canvas,
 * or the big arrow buttons on touch screens. Best score is saved locally.
 */

const BEST_KEY = 'uh_aws_sbg_starcatcher_best_v1';
type Status = 'ready' | 'playing' | 'over';

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

const StarCatcher = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<StarCatcherEngine | null>(null);
  const [status, setStatus] = useState<Status>('ready');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [best, setBest] = useState(readBest);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = createStarCatcher(canvas, {
      onScore: setScore,
      onLives: setLives,
      onCatch: () => playSfx('coin'),
      onHurt: () => playSfx('hurt'),
      onOver: (final) => {
        setStatus('over');
        setBest((b) => {
          const nb = Math.max(b, final);
          try {
            localStorage.setItem(BEST_KEY, String(nb));
          } catch {
            // not saved
          }
          return nb;
        });
      },
    });
    engineRef.current = engine;
    engine.draw();
    const onVis = () => {
      if (document.hidden && engine.running) {
        engine.stop();
        setStatus('ready');
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      engine.stop();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const start = () => {
    setStatus('playing');
    canvasRef.current?.focus();
    engineRef.current?.start();
  };

  const onKey = (e: React.KeyboardEvent, down: boolean) => {
    const left = e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A';
    const right = e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D';
    if (!left && !right) return;
    e.preventDefault();
    const d = left ? -1 : 1;
    if (down) engineRef.current?.setDir(d);
    else engineRef.current?.releaseDir(d);
  };

  const onPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.type === 'pointermove' && e.buttons === 0 && e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    engineRef.current?.setTarget(((e.clientX - rect.left) / rect.width) * GAME_W);
  };

  const hold = (dir: number) => ({
    onPointerDown: () => engineRef.current?.setDir(dir),
    onPointerUp: () => engineRef.current?.releaseDir(dir),
    onPointerLeave: () => engineRef.current?.releaseDir(dir),
  });

  return (
    <section aria-labelledby="game-heading" className="px-panel px-window max-w-md">
      <div className="px-titlebar">
        <h2 id="game-heading">Star Catcher</h2>
        <div className="px-winmarks" aria-hidden="true"><span /><span /><span /></div>
      </div>
      <div className="px-window-body">
        <p className="text-sm text-muted-foreground mb-3">
          While you're here: catch the stars, dodge the bugs. Arrow keys, or drag.
        </p>
        <div className="flex items-center justify-between text-sm font-semibold mb-2" aria-hidden="true">
          <span>Score {score}</span>
          <span className="text-[var(--beacon)]">{'♥'.repeat(Math.max(0, lives))}<span className="opacity-30">{'♥'.repeat(3 - Math.max(0, lives))}</span></span>
          <span className="text-muted-foreground">Best {best}</span>
        </div>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={GAME_W}
            height={GAME_H}
            tabIndex={0}
            role="img"
            aria-label={`Star Catcher game. Score ${score}, ${lives} lives. Use left and right arrow keys to move.`}
            className="block w-full h-auto px-game-canvas touch-none"
            onKeyDown={(e) => onKey(e, true)}
            onKeyUp={(e) => onKey(e, false)}
            onPointerDown={onPointer}
            onPointerMove={onPointer}
          />
          {status !== 'playing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[rgba(23,15,69,0.72)]">
              {status === 'over' && (
                <p className="font-bold text-foreground" aria-live="polite">
                  Game over: {score} {score === 1 ? 'star' : 'stars'}{score > 0 && score >= best ? '. New best!' : '.'}
                </p>
              )}
              <button type="button" onClick={start} className="px-button">
                {status === 'over' ? 'Play again' : 'Play'}
              </button>
            </div>
          )}
        </div>
        {status === 'playing' && (
          <div className="flex justify-between mt-3 lg:hidden">
            <button type="button" aria-label="Move left" className="px-option !px-6" {...hold(-1)}>
              <PixelIcon name="arrowLeft" size={18} />
            </button>
            <button type="button" aria-label="Move right" className="px-option !px-6" {...hold(1)}>
              <PixelIcon name="arrowRight" size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default StarCatcher;
