import "@testing-library/jest-dom";

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [0];

  disconnect(): void { }
  observe(): void { }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(): void { }
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(globalThis, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

// jsdom ships no ResizeObserver, but embla-carousel constructs one on init —
// without this, any test that mounts a carousel throws "ResizeObserver is not
// defined". A no-op is sufficient: jsdom has no layout, so a real
// implementation would never report a meaningful size change anyway. Slide
// selection behaviour is covered by mocking the embla API directly (unit) and
// by Playwright against real geometry (e2e).
class MockResizeObserver implements ResizeObserver {
  disconnect(): void { }
  observe(): void { }
  unobserve(): void { }
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver,
});

Object.defineProperty(globalThis, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver,
});

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  writable: true,
  value: () => null,
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => { },
    removeListener: () => { },
    addEventListener: () => { },
    removeEventListener: () => { },
    dispatchEvent: () => { },
  }),
});
