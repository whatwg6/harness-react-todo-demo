# Harness React Todo

A polished React + TypeScript Todo app with a pre-configured CI-grade harness: linting, type-checking, unit tests, e2e tests, visual regression screenshots, and a single `verify` command that runs them all.

The app is intentionally small, but the workflow is production-minded. It is useful as a starting point for AI agent development, UI iteration, and small React projects that need quality gates without a heavy framework.

## App Features

- Chinese Todo interface matching the provided design
- Default task list with active and completed items
- Add todos by button click or Enter key
- Toggle completion state
- Delete individual todos
- Filter by `全部`, `待办`, and `已完成`
- Live summary of active and completed counts
- Playwright screenshot coverage for visual fidelity

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Language | TypeScript 6 |
| Bundler | Vite 8 |
| Package Manager | pnpm |
| Unit Testing | Vitest + React Testing Library |
| E2E Testing | Playwright + screenshot snapshots |
| Linter | ESLint 10 (flat config) |

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9 (`npm install -g pnpm`)

## Quick Start

```bash
pnpm install

pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

For a production build:

```bash
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
│   ├── todo.spec.ts        #   Todo app e2e test suite
│   └── todo.spec.ts-snapshots/
│       └── todo-default-darwin.png
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

Located next to each component as `*.test.tsx`. Uses Vitest with jsdom and React Testing Library.

The Todo unit tests cover default rendering, adding todos, blank input handling, completion toggles, filters, deletion, and summary counts.

```bash
pnpm test
```

Example test pattern:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Todo from './Todo'

describe('Todo', () => {
  it('adds a todo', () => {
    render(<Todo />)
    fireEvent.change(screen.getByPlaceholderText('添加新的待办事项...'), {
      target: { value: '整理会议纪要' },
    })
    fireEvent.click(screen.getByRole('button', { name: '添加' }))
    expect(screen.getByText('整理会议纪要')).toBeInTheDocument()
  })
})
```

### E2E Tests

Located in `e2e/`. Uses Playwright with Chromium. Playwright's `webServer` config auto-starts the Vite dev server.

The e2e suite covers the main user flows and includes a screenshot assertion for the default Todo screen.

```bash
pnpm e2e

# Update visual snapshots after intentional UI changes
pnpm e2e --update-snapshots
```

Example test pattern:

```ts
import { test, expect } from '@playwright/test'

test('adds a todo', async ({ page }) => {
  await page.goto('/')
  await page.getByPlaceholder('添加新的待办事项...').fill('整理会议纪要')
  await page.getByRole('button', { name: '添加' }).click()
  await expect(page.getByText('整理会议纪要')).toBeVisible()
})
```

### Full Pipeline

```bash
pnpm verify
```

Runs lint, typecheck, unit tests, and e2e tests.

## Adding New Code

1. Create or update the component and its CSS.
2. Add or update a nearby `*.test.tsx` unit test.
3. Add or update a Playwright spec in `e2e/` for full-page behavior.
4. Update screenshot snapshots when the visual change is intentional.
5. Run `pnpm verify` before committing.

---

Scaffolded with `pnpm create vite` using the `react-ts` template.
