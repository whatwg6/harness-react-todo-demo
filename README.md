# harness-react-demo

A minimal React + TypeScript project scaffold with a pre-configured CI-grade harness — linting, type-checking, unit tests, e2e tests, and a single `verify` command that runs them all.

Built as a starting point for AI Agent development and small React projects that need quality gates without heavy frameworks.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Language | TypeScript 6 |
| Bundler | Vite 8 |
| Package Manager | pnpm |
| Unit Testing | Vitest + React Testing Library |
| E2E Testing | Playwright |
| Linter | ESLint 10 (flat config) |

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9 (`npm install -g pnpm`)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server (http://localhost:5173)
pnpm dev

# Build for production
pnpm build
```

## Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start Vite dev server with HMR |
| `pnpm build` | Type-check + production build |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint` | Run ESLint on all source files |
| `pnpm typecheck` | Run TypeScript compiler checks (`tsc -b`) |
| `pnpm test` | Run Vitest unit tests |
| `pnpm e2e` | Run Playwright e2e tests (auto-starts dev server) |
| `pnpm verify` | **Full pipeline:** lint → typecheck → test → e2e |

## Project Structure

```
harness-react-demo/
├── e2e/                    # Playwright e2e tests
│   └── todo.spec.ts        #   Todo app e2e test suite
├── public/                 # Static assets (favicon, icons)
├── src/                    # Application source
│   ├── assets/             #   Image assets
│   ├── App.tsx             #   Root component
│   ├── App.css             #   Root styles
│   ├── App.test.tsx        #   App component unit test
│   ├── Todo.tsx            #   Todo component
│   ├── Todo.css            #   Todo styles
│   ├── Todo.test.tsx       #   Todo component unit test
│   ├── index.css           #   Global styles
│   ├── main.tsx            #   Entry point
│   └── setupTests.ts       #   Vitest setup (@testing-library/jest-dom)
├── eslint.config.js        # ESLint flat config
├── playwright.config.ts    # Playwright configuration
├── tsconfig.json           # Root TS config (references)
├── tsconfig.app.json       # App TS config
├── tsconfig.node.json      # Node/CLI TS config (vite.config.ts)
├── tsconfig.e2e.json       # E2E test TS config
└── vite.config.ts          # Vite + Vitest configuration
```

## Testing

### Unit Tests

Located next to each component as `*.test.tsx`. Uses Vitest with jsdom environment and React Testing Library.

```bash
# Run all unit tests
pnpm test

# Watch mode
pnpm vitest
```

Example test pattern:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Todo from './Todo'

describe('Todo', () => {
  it('adds a todo', () => {
    render(<Todo />)
    fireEvent.change(screen.getByPlaceholderText('...'), {
      target: { value: 'New task' },
    })
    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByText('New task')).toBeInTheDocument()
  })
})
```

### E2E Tests

Located in `e2e/`. Uses Playwright with Chromium. Playwright's `webServer` config auto-starts the Vite dev server.

```bash
# Run all e2e tests
pnpm e2e

# With Playwright UI mode
pnpm exec playwright test --ui
```

Example test pattern:

```ts
import { test, expect } from '@playwright/test'

test('adds a todo', async ({ page }) => {
  await page.goto('/')
  await page.getByPlaceholder('Add a new todo...').fill('My task')
  await page.getByRole('button', { name: 'Add' }).click()
  await expect(page.getByText('My task')).toBeVisible()
})
```

### Full Pipeline

```bash
pnpm verify    # lint → typecheck → unit tests → e2e tests
```

## Adding New Code

1. **Component**: create `src/MyComponent.tsx` and `src/MyComponent.css`
2. **Unit test**: create `src/MyComponent.test.tsx` with the pattern above
3. **E2E test**: add a test case in `e2e/` (or a new spec file)
4. **Verify**: run `pnpm verify` before committing

---

Scaffolded with `pnpm create vite` using the `react-ts` template.
