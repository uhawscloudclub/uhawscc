import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** A controllable matchMedia for "(prefers-reduced-motion: reduce)". */
function mockReducedMotion(initial: boolean) {
    let matches = initial;
    const listeners = new Set<() => void>();
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
        get matches() {
            return query.includes("reduce") ? matches : false;
        },
        media: query,
        onchange: null,
        addEventListener: (_: string, cb: () => void) => listeners.add(cb),
        removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
    return {
        set(next: boolean) {
            matches = next;
            listeners.forEach((cb) => cb());
        },
        restore() {
            window.matchMedia = original;
        },
    };
}

describe("usePrefersReducedMotion", () => {
    let media: ReturnType<typeof mockReducedMotion> | undefined;
    afterEach(() => media?.restore());

    it("reads the preference on first render", () => {
        media = mockReducedMotion(true);
        const { result } = renderHook(() => usePrefersReducedMotion());
        expect(result.current).toBe(true);
    });

    it("updates live when the preference changes", () => {
        media = mockReducedMotion(false);
        const { result } = renderHook(() => usePrefersReducedMotion());
        expect(result.current).toBe(false);
        act(() => media!.set(true));
        expect(result.current).toBe(true);
    });
});
