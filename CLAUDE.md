# Claude Code Guidelines for UHAWSCC Website

> Model selection, general DevOps/automation principles, and the default development workflow now live in `~/.claude/CLAUDE.md` (global, applies to all projects). This file only covers what's specific to **this** repo — don't duplicate the global rules here.

## Project Context
- **Repo**: uhawscloudclub/uhawscc (React + TypeScript, Vite, Route-level lazy loading)
- **Known Issues**: Button-click crash fixed (PR #58), font preload fixed (PR #57)
- **Branch naming**: `fix/<issue>`, `feature/<feature-name>`

---

## File Structure Essentials

- Routes: declared in `src/App.tsx`; the lazy-loaded page modules themselves live in `src/pages/` (via `lazyWithReload()`)
- Components: `src/components/` (use ErrorBoundary for lazy route protection)
- Utils: `src/lib/` (type helpers, error classes, lazy loaders)
- Tests: `src/test/`
- Build config: `vite.config.ts` (pay attention to `manualChunks` — critical for production!)

---

## Known Gotchas

### Vite + React.lazy() Chunk Crashes
If users see "TypeError: X is not a function" on navigation:
1. Check `vite.config.ts` `manualChunks` — it deliberately leaves most `node_modules` unmatched (Rollup auto-chunks those, which is fine); the bug pattern is a package that's a tightly-coupled runtime dependency of something *already* manually pinned to a vendor chunk (e.g. `scheduler` under `react-dom`) but itself falls through unmatched, risking a cross-chunk init-order race
2. Add missing deps to existing chunks (e.g., `scheduler` → `vendor-react`)
3. Test with `npm run build` + `npm start` (dev server hides chunking issues)

### Custom Fonts (Google Fonts)
- Fonts must be preloaded; there's a race condition if the listener attaches late
- Solution: inline `<script>` (not deferred) in `index.html` to catch the `load` event synchronously
- Check CSP: `server.js` must allowlist the script via `sha256` hash

### Content Security Policy (CSP)
- All inline scripts/styles need `sha256-...` hash in `server.js`
- Don't use `'unsafe-inline'` (defeats the purpose of CSP)
- Update hash when script content changes

---

## Code Style Conventions

- **Naming**: camelCase for variables/functions, PascalCase for components
- **Types**: Prefer strict typing; avoid `any`
- **Testing**: Async tests → use `async`, test behavior not implementation

---

## Tools & Commands

```bash
npm run dev          # Start dev server — the one command Claude runs locally, for UX/visual checks
npm run build        # Production build — CI's job (parallel `build` job in ci.yml), not Claude's
npm test             # Unit tests (Vitest) — CI's job (parallel `test` job in ci.yml), not Claude's
npm run lint         # ESLint — CI's job (parallel `lint` job in ci.yml), not Claude's
npm start            # Serve a production build locally — only if debugging a build-specific issue
npx playwright test  # E2E tests — manual-dispatch workflow (e2e-playwright.yml), run on-demand, not per-PR
```

---

## CI/CD Pipeline (actual, not aspirational)

**[ci.yml](.github/workflows/ci.yml)** runs on every push/PR to `main`. `lint`, `test`, and `build` run as three parallel jobs on both triggers; `lockfile-check` only runs on PRs (skipped on a direct push to `main`); `ci-status` is the aggregate gate over all four:
- `lockfile-check` — package.json/package-lock.json actually stay in sync, verified with a real `npm ci`, not just a co-change diff (PR-only)
- `lint` — ESLint
- `test` — Vitest unit tests
- `build` — `vite build` only — catches chunking/bundling regressions, but does **not** type-check (no `tsc` step) and does **not** validate CSP (that requires running `server.js`, not a headless build)
- `ci-status` — required check that fails if any of the above failed; this is what branch protection should require, not the four jobs individually

**[security.yml](.github/workflows/security.yml)** runs on every push/PR to `main`, plus a weekly scheduled scan — but not every job runs on every trigger: `dependency-review` is PR-only (`if: github.event_name == 'pull_request'`), while `npm-audit` and `codeql` run on both push and PR.

**[e2e-playwright.yml](.github/workflows/e2e-playwright.yml)** is manual-dispatch only (`workflow_dispatch`) — Playwright E2E is *not* wired into every PR (kept off the critical path deliberately; run it on-demand before a risky release). It runs **two** suites in one job: the default config against the Vite dev server, then `playwright.prod.config.ts` against a real `vite build` + `vite preview`. The second is not redundant — `React.lazy` code-split chunks only exist in a production build, so specs that exercise them (e.g. the homepage community carousel) can only run there. The prod step runs even if the dev step fails, so one dispatch reports on both.

**Not yet set up (candidate improvements):**
- Pre-commit hooks (Husky + lint-staged) for instant local feedback on obvious errors
- Auto-deploy on merge to `main` (currently manual/external to this repo's CI)
- Sentry/Datadog error tracking

---

## When to Ask for Help

- Changes touch `vite.config.ts` or `server.js` → extra verification needed (these two files are where the chunking and CSP gotchas above live)

---

## Project-Specific "Do Not"

- [ ] Add `'unsafe-inline'` to CSP in `server.js` (defeats security hardening — use a `sha256` hash instead)
- [ ] Use cloud mode for this project (desktop app only — needs git/dev-server/browser preview together)
