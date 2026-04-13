# UH AWS Cloud Club Website

This is the website for the University of Houston AWS Cloud Club.

## Local Development

1. Install dependencies:
	`npm install`
2. Start development server:
	`npm run dev`
3. Run lint:
	`npm run lint`
4. Run tests:
	`npm run test`
5. Build production bundle:
	`npm run build`

## Environment Variables

Copy `.env.example` to `.env` and fill in the values (ask the club captain for credentials). `.env` is gitignored and should never be committed.

## GitHub Actions (Beginner Friendly)

This repository includes starter automation in `.github/workflows/`:

- `ci.yml`: runs lint, tests, and build
- `security.yml`: runs dependency review and CodeQL security scanning
- `e2e-playwright.yml`: manual end-to-end test run with Playwright

Dependabot is also configured in `.github/dependabot.yml` for weekly dependency updates.

Read the full beginner guide:

- [GitHub Actions Beginner Guide](docs/github-actions-beginner-guide.md)

## Team Notes

- Commit message prefix hook script is stored in `.githooks/prepare-commit-msg`.
- Each contributor must enable repo hooks locally:
  `git config core.hooksPath .githooks`
