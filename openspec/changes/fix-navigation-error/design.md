## Context

The site is a client-only Vite + React 18 SPA (`createRoot`, no SSR/hydration) using
`react-router-dom` v6 `BrowserRouter`. Since PR #41 (commit `51ffe38`), every route except
`/` is code-split with `React.lazy(() => import("./pages/X.tsx"))` inside a single
top-level `<Suspense>` in `src/App.tsx`, wrapped by a class-based `ErrorBoundary`
(`src/components/ErrorBoundary.tsx`). Vite's default output hashes chunk filenames per
build. `server.js` serves `dist/` with `express.static(distPath, { maxAge: "1y" })` for
assets and `no-cache` for `index.html` only — correct caching policy, but it means once a
new build lands on Render, the old chunk files are simply gone (`npm run build` overwrites
`dist/`, nothing is retained).

Sequence that produces the bug:
1. Tab loads at deploy N. Main bundle embeds `import()` calls pointing at deploy-N chunk
   hashes (e.g. `About-abc123.js`).
2. Deploy N+1 ships (this repo deploys often — 5 PRs in recent history). `dist/` is
   replaced; `About-abc123.js` no longer exists on the server.
3. User already on the tab clicks "About". `React.lazy` triggers
   `import("./pages/About.tsx")` → browser requests `About-abc123.js` → 404 → the dynamic
   `import()` promise rejects → React throws while resolving the lazy boundary during
   render → `ErrorBoundary.componentDidCatch` catches it → dead-end "Something went wrong".
4. User hits refresh → fresh `index.html` (no-cache) references deploy-N+1's chunk hashes
   → everything resolves → page "just works".

This matches every symptom given: intermittent (only when a deploy landed since the tab
loaded), refresh always fixes it, and the destination page itself is fine.

## Goals / Non-Goals

**Goals:**
- Automatically recover from a stale-chunk `import()` failure with no user-visible error
  screen in the common case — a single silent reload gets the user to the page they asked
  for.
- Keep `ErrorBoundary`'s fallback UI as the correct behavior for real render errors
  (bugs, thrown exceptions unrelated to chunk loading).
- Avoid infinite reload loops if a chunk is *persistently* unavailable (e.g. genuine
  deploy/CDN issue) — fail over to the visible fallback after one retry.

**Non-Goals:**
- Not changing the deploy pipeline to preserve old chunk hashes (e.g. content-addressable
  storage of every past build). That's a valid alternative but far larger in scope than
  this bug fix, and Render's free-tier static hosting doesn't support it without extra
  infrastructure.
- Not introducing a service worker / precache strategy.
- Not touching routing, auth, data-fetching, or server middleware — none of those are
  implicated (confirmed during discovery: no SSR/hydration, no auth, no route guards, no
  service worker in `public/`, `ScrollToTop`/`NavLink` are trivial and unrelated).

## Decisions

**Decision: detect chunk-load failures by error shape, not a new global error type.**
Vite-built dynamic `import()` rejections reject with an error whose `message` matches
patterns like `Failed to fetch dynamically imported module` (Chromium) or
`error loading dynamically imported module` (Firefox/Safari variants), and/or a
`TypeError` on `About-abc123.js`. Matching on `error.message` via a small regex in both
the lazy-loading helper and `ErrorBoundary.componentDidCatch` is the standard,
dependency-free way to distinguish "the chunk 404'd" from "the component threw a real
bug". Alternative considered: a dedicated `ChunkLoadError` subclass thrown by a wrapped
`import()` — chosen as the actual mechanism (see next decision) because it's more
reliable than string-matching alone and lets `ErrorBoundary` special-case it precisely.

**Decision: wrap every lazy import with a small `lazyWithReload()` helper in
`src/lib/lazyWithReload.ts`, rather than only handling it in `ErrorBoundary`.**
Wrapping at the `import()` call site lets us throw a typed, unambiguous error
(`error.name === "ChunkLoadError"`) that `ErrorBoundary` can check with `instanceof`/name
match instead of fragile string matching alone. `ErrorBoundary` still needs the catch
logic (it's the thing actually deciding to reload vs. show the fallback), but the helper
is what gives it a reliable signal.

**Decision: track "already retried" in `sessionStorage`, not component state.**
`ErrorBoundary` remounts fresh on `window.location.reload()`, so in-memory state can't
prevent a reload loop. `sessionStorage` (keyed e.g. `chunk-reload-attempted`) survives the
reload within the same tab/session and is cleared on successful navigation (or simply
left — it's a single boolean, not per-chunk, since one stale deploy typically makes *all*
not-yet-loaded chunks stale at once). On the second failure within the same session, the
existing fallback UI is shown as today, so users aren't stuck reload-looping against a
genuinely broken deploy.

**Decision: reload via `window.location.reload()` to the current URL, not
`router.push`/`navigate`.** The whole point is to re-fetch `index.html` fresh (it's
`no-cache`) so the browser gets the current build's asset manifest. A client-side
`navigate()` re-render would just re-run the same stale JS and fail again.

## Risks / Trade-offs

- [Risk] A real, non-chunk render error that happens to occur on the *first* render after
  a reload could theoretically be masked by the "already retried" flag suppressing further
  auto-reload logic → Mitigation: the flag only ever suppresses a *second automatic
  reload*; it never suppresses showing the fallback UI. Worst case is identical to today's
  behavior (fallback shown), never worse.
- [Risk] `sessionStorage` unavailable (private browsing edge cases, storage disabled) →
  Mitigation: wrap access in try/catch; if unavailable, degrade to "always attempt one
  reload per ErrorBoundary mount" (current in-memory lifetime), which is still strictly
  better than never reloading.
- [Risk] Auto-reload could discard in-progress user input on the page they were leaving
  (e.g. a partially filled contact form) if the error is misclassified → Mitigation: the
  reload only triggers for errors matching the chunk-load signature thrown by our own
  `lazyWithReload` wrapper, not generic errors, so this is scoped tightly to the
  code-splitting failure case.

## Migration Plan

Pure client-side change, no data migration, no server/API change, no feature flag needed.
Ship behind normal PR review + CI (build, lint, unit tests, Playwright e2e). Rollback is a
plain revert if needed — no persisted state format changes.
