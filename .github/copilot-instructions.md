# Copilot Instructions for uhawscc

- React + TypeScript + Vite web app for a student club (AWS Student Cloud Club). See [`CLAUDE.md`](../CLAUDE.md) for full project context, known gotchas, and the actual CI/CD structure.
- Prioritize correctness and security findings over style nits.
- Prefer the smallest correct diff over a broader refactor suggestion.
- Don't suggest changes that contradict a documented, intentional decision in `CLAUDE.md` (e.g. `react-router-dom` pinned to `^6.30.4` after a documented production incident) — flag it as a question if genuinely unsure, not a directive.
- If a PR changes a GitHub Actions workflow's job names, triggers, or structure, check whether `CLAUDE.md` and `docs/github-actions-beginner-guide.md` still describe it accurately — stale docs pointing at a renamed or removed check name has been a recurring issue in this repo.
