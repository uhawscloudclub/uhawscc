/**
 * Old URLs from before the sitemap consolidation, and where they live now.
 * Shared by server.js (real HTTP 301s, so bookmarks and search results keep
 * working) and src/App.tsx (client-side redirects for in-app links and the
 * Vite dev server, which never reaches Express for page routes).
 *
 * Fragments are sent in the Location header too; browsers apply them after
 * the redirect, and the app's ScrollToTop scrolls to the matching section.
 */
export const LEGACY_ROUTES = {
  "/about": "/community",
  "/team": "/community#team",
  "/learning-paths": "/learn",
  "/resources": "/learn#free-resources",
  // The News page (an embed of an external feed) was removed.
  "/news": "/learn",
};

/**
 * Builds the redirect target for a legacy path, keeping the original query
 * string ("?utm_source=x") and placing it before any fragment.
 */
export function legacyRedirectTarget(target, search = "") {
  const hashIndex = target.indexOf("#");
  const path = hashIndex === -1 ? target : target.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : target.slice(hashIndex);
  const query = search && search !== "?" ? (search.startsWith("?") ? search : `?${search}`) : "";
  return `${path}${query}${hash}`;
}
