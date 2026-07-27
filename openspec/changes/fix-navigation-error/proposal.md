## Why

Client-side navigation (clicking a `<Link>`/`<NavLink>` to another route) intermittently
renders the `ErrorBoundary` fallback ("Something went wrong"), while a hard refresh of the
same destination URL always loads it correctly. This is the classic "stale deployed chunk"
failure mode for code-split SPAs: the browser tab is running JS built at deploy N, the user
navigates to a lazy-loaded route whose chunk filename is content-hashed, a newer deploy
(N+1) has since overwritten `dist/` on the server so that exact hashed file no longer
exists, the dynamic `import()` 404s, React throws during `Suspense`/lazy resolution, and
`ErrorBoundary` catches it with a dead-end message and no recovery path other than manual
refresh. This became possible only after route-level code splitting
(`React.lazy()` + `Suspense`) was introduced in PR #41 ("perf: improve PageSpeed scores",
commit `51ffe38`) — before that, all pages were bundled eagerly and there was no post-load
`import()` that could fail.

## What Changes

- Detect dynamic-`import()` / chunk-load failures specifically (both in the router's lazy
  boundary and in `ErrorBoundary`) and recover automatically with a single forced reload,
  instead of surfacing a dead-end "Something went wrong" screen for a problem the app can
  self-heal.
- Guard against a reload loop: only auto-reload once per failed chunk (tracked via
  `sessionStorage`), so a genuinely broken deploy still surfaces the fallback UI on the
  second failure rather than reload-looping forever.
- Keep `ErrorBoundary`'s existing fallback UI as the backstop for all *other* (non-chunk)
  render errors — this change narrows the failure it currently over-applies to, it does not
  remove the boundary.

## Capabilities

### New Capabilities
- `spa-chunk-recovery`: client-side behavior that detects a failed lazy-route chunk load
  (stale deploy) and recovers by reloading the page automatically, at most once per chunk,
  before falling back to the generic error UI.

### Modified Capabilities
(none — no existing `openspec/specs/` capabilities predate this change)

## Impact

- `src/App.tsx` — wrap/replace the bare `lazy()` calls with a retry-and-reload helper.
- `src/components/ErrorBoundary.tsx` — classify caught errors; auto-reload once on a
  detected chunk-load error instead of always rendering the fallback.
- New: a small shared helper (e.g. `src/lib/lazyWithReload.ts`) used by every lazy route
  import in `App.tsx`.
- No server, routing, auth, or data-fetching changes — this is purely a client-side JS
  loading concern. `server.js`'s existing `index.html: no-cache` / hashed-asset
  `max-age: 1y` headers are correct and unaffected.
- Tests: extend `src/test/ErrorBoundary.test.tsx` (and/or add a focused test) to cover the
  chunk-load-error-triggers-reload path without triggering it for ordinary render errors.
