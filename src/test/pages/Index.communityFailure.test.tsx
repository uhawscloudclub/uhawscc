import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/pages/Index";
import { EXTERNAL_LINKS } from "@/config/externalLinks";
import { renderWithRouter } from "../test-utils";

/**
 * Proves the optional community section fails closed: a broken carousel must
 * take its whole section with it (heading, border, spacing) and leave every
 * other part of the homepage usable. Lives in its own file because supplying
 * non-empty photo data and a throwing component both require hoisted module
 * mocks, which are file-scoped.
 */

const { testPhoto } = vi.hoisted(() => ({
  testPhoto: {
    id: "test-photo-1",
    src: "/community/2026-09-08-gbm-01.webp",
    srcSmall: "/community/2026-09-08-gbm-01-600.webp",
    width: 1200,
    height: 750,
    alt: "Students at a general body meeting",
    caption: "First General Body Meeting",
    event: "First General Body Meeting",
    date: "2026-09-08",
    category: "gbm" as const,
  },
}));

vi.mock("@/data/communityPhotos", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/data/communityPhotos")>();
  return {
    ...actual,
    communityPhotos: [testPhoto],
    getCommunityPhotos: () => [testPhoto],
  };
});

vi.mock("@/components/CommunityCarousel", () => ({
  default: () => {
    throw new Error("simulated carousel failure");
  },
}));

beforeEach(() => {
  // React logs caught boundary errors; keep the run readable.
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Home page — community section failure", () => {
  it("removes the entire optional section but leaves the homepage usable", async () => {
    renderWithRouter(<HomePage />);

    // The section, including its heading, is gone — not an empty labelled band.
    await waitFor(() => {
      expect(screen.queryByText(/our community/i)).not.toBeInTheDocument();
    });

    // Everything else survives.
    expect(
      screen.getByRole("heading", { name: /Build cloud skills/i }),
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link", { name: /Join our community/i })
        .some((l) => l.getAttribute("href") === EXTERNAL_LINKS.meetup),
    ).toBe(true);
    expect(screen.getByText(/members on Meetup/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Three things/i }),
    ).toBeInTheDocument();

    // The app-level boundary must not have taken over the page.
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });
});
