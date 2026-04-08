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

What it does in order:
1. checks out the repo
2. installs Node.js 20
3. runs `npm ci`
4. runs `npm run lint`
5. runs `npm run test`
6. runs `npm run build`

Why this helps:
- catches broken code before merge
- ensures teammates do not merge failing builds

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
- opens weekly PRs for npm package updates
- opens weekly PRs for GitHub Actions updates

Why this helps:
- keeps dependencies current and safer
- makes updates small and regular

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
- `Lint, Test, Build`
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
