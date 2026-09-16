---
name: code-review
description: Repository-specific code review checklist for uhawscc. Use when reviewing pull requests or proposed changes to this repository.
---

When reviewing a pull request in this repository, check for the following. These are drawn from real bugs this project has actually shipped and caught, not generic advice — add to this list as new ones are found.

## Shell scripting in GitHub Actions

- Backticks inside a DOUBLE-quoted shell string are command substitution, not markdown formatting. A `run:` step that builds a PR comment/output body containing inline code spans (`` `like this` ``) must use a single-quoted heredoc or write to a file and pass it via `--body-file`, never inline double-quoted interpolation — the latter silently executes `` `react-router-dom` `` etc. as shell commands and mangles the output.
- Untrusted or externally-supplied text (PR titles, user input, branch names) must be passed via `env:` and referenced as `"$VAR"`, never interpolated directly into a `run:` script body.
- On a PR from a fork, the head commit's SHA belongs to the fork's repo, not `origin` (the base repo). Fetching it by raw SHA from `origin` can fail. Fetch `refs/pull/<N>/head` instead — GitHub always mirrors that ref onto the base repo regardless of where the PR came from.

## CI gating

- Any aggregate/required status check using `needs.*.result` must treat a `cancelled` job result the same as `failure` — a job killed by `concurrency: cancel-in-progress` reports `cancelled`, not `failure`, and a check that only looks for `failure` can go green without every job actually completing.
- A "lockfile is in sync" check that only verifies `package.json` and `package-lock.json` were *both touched* in a diff is a co-change check, not a real sync check — a stale or hand-edited lockfile still passes. The real check is running `npm ci` (it fails hard on any manifest/lockfile mismatch).

## Vite / `manualChunks` (`vite.config.ts`)

- `manualChunks` intentionally leaves most `node_modules` packages unassigned — Rollup auto-chunks those, which is fine. Only flag a *missing* assignment when it's a tightly-coupled runtime dependency of a package that's *already* manually pinned to a vendor chunk (e.g. `scheduler` under `react-dom`, `use-sync-external-store` under `@radix-ui`) — not as a blanket "every dependency needs an explicit chunk" rule. The actual failure mode is a cross-chunk module-initialization race, surfacing as `TypeError: X is not a function` deep in a vendor bundle.

## CSP (`server.js`)

- Any new inline `<script>` or runtime-injected `<style>` needs its exact `sha256-...` hash added to the relevant CSP directive in `server.js`. Never suggest `'unsafe-inline'` as the fix — it defeats the purpose of the CSP.
- A font-preload (or similar) listener that needs to catch a cross-origin resource's `load` event must be a synchronous inline `<script>` (no `defer`, no `type="module"`) placed immediately after the resource — a deferred/external script can lose the race against the resource load and silently strand the fallback state.

## React effects

- `window.scrollTo()` returns a `Promise` in current Chrome (it used to return nothing). `useEffect(() => window.scrollTo(0, 0), [deps])` implicitly returns that Promise, which React treats as the effect's cleanup function and tries to call on unmount — throwing on every navigation. Any one-line effect body needs braces (`useEffect(() => { window.scrollTo(0, 0); }, [deps])`) to avoid accidentally returning a value as a cleanup function.

## Dependency pins

- `react-router-dom` is intentionally pinned to `^6.30.4` (see `CLAUDE.md` and `.github/scripts/check-audit.mjs`'s `ALLOWLIST`) — v7 wraps all navigation in an unconditional `React.startTransition`, which caused a real production incident with this app's Suspense/lazy route tree. Don't suggest bumping to v7 without flagging that history first.

## Documentation accuracy

- If a PR changes a workflow's job names, triggers, or structure, check that `CLAUDE.md` and `docs/github-actions-beginner-guide.md` still accurately describe it — stale docs pointing at a renamed or removed status-check name (e.g. still requiring `Lint, Test, Build` after it was split into parallel jobs) can misconfigure branch protection.
