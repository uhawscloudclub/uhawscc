# GitHub Actions Beginner Guide

This project now includes starter GitHub Actions workflows.

## What GitHub Actions does

GitHub Actions runs scripts for you in GitHub every time something happens (like opening a pull request).

Think of it as a robot teammate that:
- checks code quality
- runs tests
- checks security
- can run browser tests

## Files added

- `.github/workflows/ci.yml`
- `.github/workflows/security.yml`
- `.github/workflows/e2e-playwright.yml`
- `.github/dependabot.yml`

## Workflow 1: CI

File: `.github/workflows/ci.yml`

Runs on:
- every push to `main`
- every pull request into `main`

`lint`, `test`, and `build` run on both triggers, in parallel (not one after another) — each checks out the repo, installs Node.js 20, and runs `npm ci` before its own step:
- `lint` — runs `npm run lint`
- `test` — runs `npm run test`
- `build` — runs `npm run build`

A fourth job, `lockfile-check`, only runs on pull requests (skipped on a direct push to `main`) — so only three jobs run on a push. It's structured differently from the other three: first a quick check that `package-lock.json` was touched whenever `package.json` was, then Node.js setup and a real `npm ci` to verify the lockfile's content actually matches (not just that both files were edited).

A fifth job, `ci-status`, waits on whichever of the above ran for that trigger and is the single required status check — it fails if any job failed or was cancelled.

Why this helps:
- catches broken code before merge
- ensures teammates do not merge failing builds
- parallel jobs mean total CI time is bounded by the slowest job, not the sum of all of them

## Workflow 2: Security

File: `.github/workflows/security.yml`

Runs on:
- push to `main`
- pull requests into `main`
- weekly schedule
- manual run

Jobs:
- Dependency Review (PR only): checks dependency changes in pull requests
- CodeQL Analysis: scans code for common security issues

Why this helps:
- catches risky dependency updates early
- catches security smells automatically

## Workflow 3: E2E Playwright (Manual)

File: `.github/workflows/e2e-playwright.yml`

Runs on:
- manual trigger only (`workflow_dispatch`)

What it does:
1. installs dependencies
2. installs Playwright Chromium browser
3. runs `npx playwright test`
4. uploads report artifacts if tests fail

Why manual first:
- beginner teams can learn without blocking every pull request
- once stable, you can also run this automatically on pull requests

## Dependabot

File: `.github/dependabot.yml`

What it does:
- opens weekly PRs for npm package updates (patch/minor bumps grouped into one PR; major bumps get their own PR, since those are the ones worth reviewing carefully — see the `react-router-dom` note in `CLAUDE.md`)
- opens weekly PRs for GitHub Actions updates (grouped into one PR)

Why this helps:
- keeps dependencies current and safer
- makes updates small and regular
- grouping cuts down on PR noise without hiding the changes that actually need individual review

**This file only covers routine version updates on a schedule.** It does *not* automatically fix a newly-disclosed vulnerability the moment it's published — that's a separate, admin-only repo setting:

> Settings → Code security → **Dependabot alerts** (on) → **Dependabot security updates** (on)

With that on, Dependabot opens a dedicated fix PR as soon as a vulnerability is disclosed, instead of it only surfacing via a failing `npm audit` check on whatever PR happens to be open at the time.

## Copilot Code Review

Files: `.github/copilot-instructions.md`, `.github/skills/code-review/SKILL.md`

GitHub Copilot can review pull requests automatically (this is the `copilot-pull-request-reviewer[bot]` you'll see commenting on PRs). Two files steer what it looks for in this repo:

- `.github/copilot-instructions.md` — short, repo-wide guidance applied to every review (e.g. "prefer the smallest correct diff").
- `.github/skills/code-review/SKILL.md` — a longer, detailed checklist Copilot pulls in when relevant, built from real bugs this project has actually shipped and caught (shell-quoting mistakes in workflows, the CI cancelled-job gating bug, the `manualChunks` gotcha, CSP hash rules, the pinned `react-router-dom` version, and more).

Copilot also automatically reads `CLAUDE.md` (and `GEMINI.md`/`REVIEW.md`, if present) from the pull request's branch for additional context — no extra setup needed for that part.

Why this helps:
- encodes hard-won lessons so the same class of bug gets caught automatically next time, instead of relying on a human (or Claude) remembering it
- keeps review feedback specific to this project instead of generic style commentary

## How to view results in GitHub

1. Open your repository on GitHub
2. Click the `Actions` tab
3. Click any workflow run
4. Expand each job and step to see logs

Green checkmark means pass.
Red X means fail.

## Recommended branch protection setup

In GitHub: Settings -> Branches -> Branch protection rules -> `main`

Require these status checks before merge:
- `CI Status`
- `CodeQL Analysis`

You can add E2E later when your Playwright suite is stable.

## Common beginner issues

- `npm ci` fails:
  - lockfile may be out of sync
  - run `npm install`, commit lockfile changes, push again

- tests pass locally but fail in Actions:
  - local environment may differ from Linux runner
  - read the logs in Actions and fix portability issues

- workflow not running:
  - verify file path is exactly `.github/workflows/*.yml`
  - verify branch filters include your branch target

## Next learning steps

1. Add badges in README for CI and security status
2. Add pull request template with a checklist
3. Promote E2E workflow from manual to pull-request trigger when stable
