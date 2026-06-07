# AGENTS.md for harness-react-demo

This file is written for AI coding agents (Claude, Codex, etc.) working on this project.

## Project Identity

A minimal React + TypeScript scaffold with pre-configured lint, typecheck, unit tests, e2e tests, and a single `verify` command. Built as a starting point for AI agent development.

## Tech Stack

- **Framework:** React 19
- **Language:** TypeScript 6
- **Bundler:** Vite 8
- **Package Manager:** pnpm (do not use npm or yarn)
- **Unit Testing:** Vitest + React Testing Library
- **E2E Testing:** Playwright (Chromium)
- **Linter:** ESLint 10 flat config
- **Routing:** Hash-based (`window.location.hash`), no external dependencies

## Project Structure

```
src/
├── pages/          # One dir per page: PageName.tsx, PageName.css, PageName.test.tsx
│   └── Todo/
├── components/     # Shared components, same triad pattern
├── lib/            # Utilities and hooks
├── assets/         # Images
├── router.ts       # Hash-based route definitions
├── App.tsx
├── main.tsx
└── setupTests.ts
e2e/                # Playwright specs (one per feature area)
```

## Conventions

- **Each page/component**: `.tsx` + `.css` + `.test.tsx` triad in its own directory.
- **Tests**: Vitest + `@testing-library/react`. Render, fire event, assert with `screen`.
- **E2E**: Navigate with `page.goto('/')`, use accessible locators (`getByRole`, `getByPlaceholder`). Use `toHaveScreenshot()` for visual fidelity checks (baselines auto-generated on first run).
- **CSS**: Plain global `.css` files, kebab-case class names, scoped to component name.
- **Imports**: Import directly from file paths — no barrel `index.ts` files.
- **TypeScript**: Explicit interfaces for props/state. Avoid `any`.
- **Config files**: `package.json`, `vite.config.ts`, `playwright.config.ts`, `tsconfig*.json`, `eslint.config.js` — do not modify unless explicitly asked.

## Available Scripts

| Command | Speed | What It Verifies |
|---|---|---|
| `pnpm typecheck` | ~1s | Type correctness |
| `pnpm test` | ~2s | Component behavior |
| `pnpm lint` | ~2s | Code quality |
| `pnpm e2e` | ~15s | Functional flow + UI fidelity |
| `pnpm verify` | ~20s | All of the above |

---

## Development Workflow

When given a design (mockup, screenshot, or detailed description), follow this sequence without involving the user.

### 1. Decompose design into test specs

Before writing implementation code, translate the design into:

- **E2E test** in `e2e/` — encodes the full user flow AND visual expectations:
  - Navigate to the page
  - Assert key elements exist (headings, buttons, inputs) via accessible locators
  - Interact with the page (type, click, toggle)
  - Assert expected outcomes (list items, state changes, CSS classes)
  - Use `toHaveScreenshot()` to catch visual regressions against the design
- **Unit test** for each component — edge cases, state transitions, empty/loading/error states

### 2. Build with fast feedback

Implement one piece at a time. After each piece:

```
pnpm typecheck && pnpm test    # ~3s — code correctness
```

This is the inner loop. Stay in it until all unit tests pass.

### 3. Verify with the full harness

```
pnpm verify    # ~20s — lint → typecheck → test → e2e
```

`e2e` is the final word. The e2e test encodes the design's UI and functional expectations. If it passes, the implementation matches the spec.

### 4. Deliver

You are done when `pnpm verify` passes. Do not ask the user for confirmation. Do not hand off. The harness is the authority.

If `pnpm verify` fails, diagnose and fix. Repeat step 3 until it passes.

---

## Key Constraints

1. **Do not change `package.json`, `vite.config.ts`, `playwright.config.ts`, `tsconfig*.json`, `eslint.config.js`** unless the task specifically requires it.
2. **Do not install new dependencies** — use hash-based routing, no external router.
3. **Do not use npm or yarn** — pnpm only.
4. **Do not refactor unrelated code.**
5. **Do not bother the user.** The harness is your feedback loop.
