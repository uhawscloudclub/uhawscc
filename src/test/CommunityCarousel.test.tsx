import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CommunityCarousel from "@/components/CommunityCarousel";
import type { CommunityPhoto } from "@/data/communityPhotos";

/**
 * These run against the REAL embla, which is the point: it proves the
 * ResizeObserver mock in src/test/setup.ts actually lets the carousel mount
 * under jsdom. Assertions that depend on layout (which slide is selected,
 * whether next/prev are disabled) live in CommunityCarousel.embla.test.tsx
 * with a mocked api — jsdom has no layout, so embla cannot compute snaps here.
 */

function makePhotos(count: number): CommunityPhoto[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `photo-${i + 1}`,
    src: `/community/2026-09-0${(i % 9) + 1}-event-${i + 1}.webp`,
    srcSmall: `/community/2026-09-0${(i % 9) + 1}-event-${i + 1}-600.webp`,
    width: 1200,
    height: 750,
    alt: `Students at event number ${i + 1}`,
    caption: `Caption ${i + 1}`,
    event: `Event ${i + 1}`,
    date: "2026-09-08",
    category: "gbm" as const,
  }));
}

describe("CommunityCarousel", () => {
  it("renders one slide per record", () => {
    render(<CommunityCarousel photos={makePhotos(3)} />);
    expect(screen.getAllByRole("group")).toHaveLength(3);
  });

  it("caps rendering at 8 slides even when given more", () => {
    render(<CommunityCarousel photos={makePhotos(12)} />);
    expect(screen.getAllByRole("group")).toHaveLength(8);
  });

  it("renders nothing at all when there are no photos", () => {
    const { container } = render(<CommunityCarousel photos={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a plain figure with no carousel chrome for a single photo", () => {
    render(<CommunityCarousel photos={makePhotos(1)} />);

    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /previous slide/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /next slide/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("gives every image non-empty alt text and intrinsic dimensions", () => {
    render(<CommunityCarousel photos={makePhotos(3)} />);

    for (const img of screen.getAllByRole("img")) {
      expect(img.getAttribute("alt")).toBeTruthy();
      expect(img).toHaveAttribute("width", "1200");
      expect(img).toHaveAttribute("height", "750");
    }
  });

  it("lazy-loads images and serves both widths via srcset", () => {
    render(<CommunityCarousel photos={makePhotos(2)} />);

    const [img] = screen.getAllByRole("img");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(img.getAttribute("srcset")).toContain("600w");
    expect(img.getAttribute("srcset")).toContain("1200w");
    // Below a full-screen hero, a high-priority hint would compete with real
    // above-the-fold content.
    expect(img).not.toHaveAttribute("fetchpriority");
  });

  it("names the carousel region and makes it focusable", () => {
    render(<CommunityCarousel photos={makePhotos(3)} />);

    const region = screen.getByRole("region", {
      name: /photos from cloudhub uh events/i,
    });
    // Without tabIndex the primitive's arrow-key handler never fires for a
    // keyboard user who has not already focused something inside it.
    expect(region).toHaveAttribute("tabindex", "0");
  });

  it("labels each slide with its position and caption", () => {
    render(<CommunityCarousel photos={makePhotos(3)} />);

    expect(screen.getByRole("group", { name: "1 of 3: Caption 1" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "3 of 3: Caption 3" })).toBeInTheDocument();
  });

  it("exposes accessible names on both controls", () => {
    render(<CommunityCarousel photos={makePhotos(3)} />);

    expect(screen.getByRole("button", { name: /previous slide/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next slide/i })).toBeInTheDocument();
  });

  it("announces the current slide politely", () => {
    render(<CommunityCarousel photos={makePhotos(3)} />);

    const status = screen.getByText(/slide 1 of 3: caption 1/i);
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-atomic", "true");
  });

  it("keeps a failed image's slide and shows an unavailable state", () => {
    render(<CommunityCarousel photos={makePhotos(3)} />);

    fireEvent.error(screen.getAllByRole("img")[0]);

    // The slide must survive: removing it after embla initialises would
    // desync slide count, canScrollNext, the position labels and the live
    // region all at once.
    expect(screen.getAllByRole("group")).toHaveLength(3);
    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(screen.getByRole("group", { name: "1 of 3: Caption 1" })).toBeInTheDocument();
    expect(screen.getByText("Photo unavailable")).toBeInTheDocument();
  });

  it("does not duplicate the caption when an image fails", () => {
    render(<CommunityCarousel photos={makePhotos(3)} />);

    fireEvent.error(screen.getAllByRole("img")[0]);

    // The frame shows "Photo unavailable"; the caption stays in the figcaption
    // exactly once rather than being echoed inside the frame.
    expect(screen.getAllByText("Caption 1")).toHaveLength(1);
  });
});
