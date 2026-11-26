import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CommunityCarousel from "@/components/CommunityCarousel";
import type { CommunityPhoto } from "@/data/communityPhotos";

/**
 * embla is mocked here on purpose. jsdom has no layout, so the real library
 * cannot compute scroll snaps — selection state and disabled ends would be
 * meaningless. Mocking the api makes those deterministic; real geometry is
 * covered by Playwright. Everything that does NOT depend on layout is tested
 * against the real embla in CommunityCarousel.test.tsx.
 */
const { mockApi, mockUseEmbla, listeners } = vi.hoisted(() => {
  const handlers = new Map<string, () => void>();
  const api = {
    canScrollPrev: vi.fn(() => true),
    canScrollNext: vi.fn(() => true),
    scrollPrev: vi.fn(),
    scrollNext: vi.fn(),
    selectedScrollSnap: vi.fn(() => 0),
    on: vi.fn((event: string, handler: () => void) => {
      handlers.set(event, handler);
    }),
    off: vi.fn((event: string) => {
      handlers.delete(event);
    }),
  };
  return {
    mockApi: api,
    mockUseEmbla: vi.fn(() => [vi.fn(), api]),
    listeners: handlers,
  };
});

vi.mock("embla-carousel-react", () => ({ default: mockUseEmbla }));

function makePhotos(count: number): CommunityPhoto[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `photo-${i + 1}`,
    src: `/community/photo-${i + 1}.webp`,
    srcSmall: `/community/photo-${i + 1}-600.webp`,
    width: 1200,
    height: 750,
    alt: `Students at event ${i + 1}`,
    caption: `Caption ${i + 1}`,
    event: `Event ${i + 1}`,
    date: "2026-09-08",
    category: "workshop" as const,
  }));
}

function setReducedMotion(reduce: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: reduce && query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

beforeEach(() => {
  listeners.clear();
  mockUseEmbla.mockClear();
  mockApi.selectedScrollSnap.mockReturnValue(0);
  setReducedMotion(false);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("CommunityCarousel — embla wiring", () => {
  it("uses an animated scroll duration by default", () => {
    render(<CommunityCarousel photos={makePhotos(3)} />);

    expect(mockUseEmbla).toHaveBeenCalledWith(
      expect.objectContaining({ duration: 25 }),
      undefined,
    );
  });

  it("drops the scroll animation entirely under prefers-reduced-motion", () => {
    setReducedMotion(true);
    render(<CommunityCarousel photos={makePhotos(3)} />);

    expect(mockUseEmbla).toHaveBeenCalledWith(
      expect.objectContaining({ duration: 0 }),
      undefined,
    );
  });

  it("updates the live announcement when the selected slide changes", () => {
    render(<CommunityCarousel photos={makePhotos(3)} />);
    expect(screen.getByText(/slide 1 of 3: caption 1/i)).toBeInTheDocument();

    mockApi.selectedScrollSnap.mockReturnValue(2);
    act(() => {
      listeners.get("select")?.();
    });

    expect(screen.getByText(/slide 3 of 3: caption 3/i)).toBeInTheDocument();
  });

  it("removes both embla listeners on unmount", () => {
    const { unmount } = render(<CommunityCarousel photos={makePhotos(3)} />);
    unmount();

    // The shared primitive previously leaked "reInit" by removing only
    // "select"; both this component and the primitive must clean up fully.
    expect(mockApi.off).toHaveBeenCalledWith("select", expect.any(Function));
    expect(mockApi.off).toHaveBeenCalledWith("reInit", expect.any(Function));
  });

  it("disables a control when embla reports that edge is unreachable", () => {
    mockApi.canScrollPrev.mockReturnValue(false);
    render(<CommunityCarousel photos={makePhotos(3)} />);

    expect(screen.getByRole("button", { name: /previous slide/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next slide/i })).toBeEnabled();
  });
});
