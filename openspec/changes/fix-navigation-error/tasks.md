## 1. Git Cleanup & Branch Setup

- [ ] 1.1 Inspect local and remote branches; identify merged vs. unmerged
- [ ] 1.2 Present deletion candidates to user for confirmation before deleting
- [ ] 1.3 Delete confirmed stale branches (local + remote), preserving `main` and any
      unmerged work
- [ ] 1.4 Checkout latest `main`, pull, create `fix/navigation-error` branch

## 2. Chunk-Load Detection Helper

- [ ] 2.1 Add `src/lib/lazyWithReload.ts`: wraps `React.lazy(factory)`, catches the
      factory's rejected promise, and re-throws a typed `ChunkLoadError` when the
      rejection matches known dynamic-import-failure signatures
- [ ] 2.2 Update `src/App.tsx` to use `lazyWithReload()` in place of raw `lazy()` for all
      eight non-home routes

## 3. ErrorBoundary Recovery Logic

- [ ] 3.1 In `src/components/ErrorBoundary.tsx`, detect `ChunkLoadError` in
      `componentDidCatch`/`getDerivedStateFromError`
- [ ] 3.2 On first detection in the session (checked via a `sessionStorage` flag, guarded
      with try/catch for storage-unavailable environments), call
      `window.location.reload()` instead of rendering the fallback
- [ ] 3.3 On a repeat chunk-load failure within the same session, fall through to the
      existing fallback UI unchanged
- [ ] 3.4 Leave behavior for non-chunk errors unchanged (existing fallback UI, dev console
      logging)

## 4. Tests

- [ ] 4.1 Extend `src/test/ErrorBoundary.test.tsx` with a case: a thrown `ChunkLoadError`
      triggers `window.location.reload()` once and does not render the fallback text
- [ ] 4.2 Add a case: a second `ChunkLoadError` in the same session renders the fallback
      instead of reloading again
- [ ] 4.3 Confirm existing "normal error → fallback UI" test still passes unmodified
- [ ] 4.4 Run full `npm test`, `npm run lint`, `npm run build` and fix any regressions

## 5. Manual Verification

- [ ] 5.1 Build the app, start the server, and manually simulate a stale chunk (rename/
      delete a lazy route's chunk file in `dist/assets/`) — confirm navigating to that
      route triggers exactly one silent reload and lands on the page (or, on second
      failure, shows the fallback)
- [ ] 5.2 Verify normal navigation (no stale chunks) across all routes has no console
      errors, no hydration/dev warnings, and no behavior change
- [ ] 5.3 Verify hard refresh on every route still works as before
