import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CountUp from "@/components/CountUp";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

// An IntersectionObserver that reports every observed element as visible.
class VisibleIO {
    constructor(private cb: IntersectionObserverCallback) {}
    observe(el: Element) {
        queueMicrotask(() => this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as unknown as IntersectionObserver));
    }
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
}

// setup.ts defines IntersectionObserver as writable (not configurable), so
// swap it by assignment rather than vi.stubGlobal.
const RealIO = window.IntersectionObserver;
function installVisibleIO() {
    window.IntersectionObserver = VisibleIO as unknown as typeof IntersectionObserver;
    globalThis.IntersectionObserver = window.IntersectionObserver;
}

afterEach(() => {
    window.IntersectionObserver = RealIO;
    globalThis.IntersectionObserver = RealIO;
    vi.useRealTimers();
    document.documentElement.classList.remove("px-reveal-on");
});

describe("CountUp", () => {
    it("always gives screen readers the final value", () => {
        render(<CountUp value="154" />);
        expect(screen.getByText("154")).toHaveClass("sr-only");
    });

    it("counts up to the exact value, keeping decimals", async () => {
        installVisibleIO();
        vi.useFakeTimers();
        const { container } = render(<CountUp value="4.9" />);
        const visible = container.querySelector('[aria-hidden="true"]')!;
        expect(visible).toHaveTextContent("0.0");
        await act(async () => {
            await Promise.resolve();
            vi.advanceTimersByTime(1000);
        });
        expect(visible).toHaveTextContent("4.9");
    });
});

describe("useRevealOnScroll", () => {
    const Page = () => {
        useRevealOnScroll("/x");
        return <ul><li className="px-join-card" data-testid="card">A</li></ul>;
    };

    it("boots a card up when it scrolls into view", async () => {
        installVisibleIO();
        render(<Page />);
        expect(document.documentElement).toHaveClass("px-reveal-on");
        await act(async () => { await Promise.resolve(); });
        expect(screen.getByTestId("card")).toHaveClass("is-in", "px-boot");
    });

    it("hides nothing for reduced motion", () => {
        const mm = window.matchMedia;
        window.matchMedia = ((q: string) => ({ ...mm(q), matches: q.includes("reduce") })) as typeof window.matchMedia;
        try {
            render(<Page />);
            expect(document.documentElement).not.toHaveClass("px-reveal-on");
        } finally {
            window.matchMedia = mm;
        }
    });
});
