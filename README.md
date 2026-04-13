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

### Server (runtime — set in Render.com dashboard under Environment)

| Variable | Required | Description |
|---|---|---|
| `RESEND_API_KEY` | Yes | Resend API key for contact form email delivery |
| `CONTACT_TO` | Yes | Email address that receives contact form submissions |
| `TURNSTILE_SECRET_KEY` | Optional | Cloudflare Turnstile secret key — enables server-side bot verification |

### Frontend (build-time — must be set before Render builds the site)

| Variable | Required | Description |
|---|---|---|
| `VITE_TURNSTILE_SITE_KEY` | Optional | Cloudflare Turnstile site key — shows the CAPTCHA widget in the contact form |

> **Note:** `VITE_*` variables are baked into the frontend bundle at build time. After adding or changing them in Render, trigger a **Manual Deploy** to rebuild.

### Local development

Create a `.env` file in the project root (already in `.gitignore`):

```
RESEND_API_KEY=re_...
CONTACT_TO=your@email.com
TURNSTILE_SECRET_KEY=...      # optional
VITE_TURNSTILE_SITE_KEY=...   # optional
```

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
