import { describe, expect, it, vi } from "vitest";
import { createStarCatcher, GAME_H } from "@/lib/starCatcher";

function engine() {
    const cb = { onScore: vi.fn(), onLives: vi.fn(), onOver: vi.fn() };
    // jsdom has no canvas context; the engine skips drawing when there is none.
    const canvas = document.createElement("canvas");
    vi.spyOn(canvas, "getContext").mockReturnValue(null);
    // random() = 0.99: spawned items are stars, far right; keeps tests deterministic.
    return { e: createStarCatcher(canvas, cb, () => 0.99), cb };
}

const playerRow = GAME_H - 4 - 18;

describe("Star Catcher engine", () => {
    it("scores a star that lands on the astronaut", () => {
        const { e, cb } = engine();
        e.spawn({ x: e.playerX + 2, y: playerRow - 4, kind: "star", vy: 100 });
        e.step(0.05);
        expect(cb.onScore).toHaveBeenLastCalledWith(1);
    });

    it("loses a life on a bug, and ends the game at zero", () => {
        const { e, cb } = engine();
        for (let i = 0; i < 3; i++) {
            e.spawn({ x: e.playerX + 2, y: playerRow - 4, kind: "bug", vy: 100 });
            e.step(0.05);
        }
        expect(cb.onLives).toHaveBeenLastCalledWith(0);
        expect(cb.onOver).toHaveBeenCalledWith(0);
    });

    it("moves with arrow-key direction and stays on screen", () => {
        const { e } = engine();
        const startX = e.playerX;
        e.setDir(-1);
        e.step(0.05);
        expect(e.playerX).toBeLessThan(startX);
        for (let i = 0; i < 100; i++) e.step(0.05);
        expect(e.playerX).toBe(0);
    });
});
