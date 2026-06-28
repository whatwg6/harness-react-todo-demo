# Harness React Todo

一个 React + TypeScript + Vite Todo 页面实现，用来验证 AI 是否能根据视觉参考完成代码还原。项目本身很小，但配了一套完整 harness：lint、typecheck、unit tests、Playwright e2e、本地截图回归，以及一个 `pnpm verify` 命令。

## 项目背景与经验总结

这个项目在补 CI 时踩到了 Playwright 截图测试的几个典型问题。Todo 页面本身很小，功能 e2e 很稳定，但一旦把 `toHaveScreenshot()` 放进 CI，测试就会受到运行环境影响，变成不稳定的质量门槛。

主要问题集中在这些地方：

- Playwright 截图基线按平台区分。仓库里已有的是 `*-darwin.png`，CI 如果跑在 `ubuntu-latest`，会寻找 `*-linux.png`，没有对应基线就会失败。
- 即使切到 `macos-latest`，GitHub Actions 的 macOS、Chromium patch、字体渲染和抗锯齿也可能和本机不同，出现 1 个像素差异也会让截图断言失败。
- 给截图断言加 `maxDiffPixels` 可以缓解轻微抖动，但这只是容忍误差，不是根治环境差异；阈值设大了还会削弱视觉回归测试价值。
- 在 CI 安装 Chromium 会增加耗时。Ubuntu 还需要 `--with-deps` 安装系统依赖，macOS runner 又更贵、更慢，不适合作为单纯截图兼容方案。
- 团队成员的机器不同，直接提交各自生成的截图基线会让快照混乱。视觉基线必须来自一个约定好的固定环境，否则 review 时很难判断差异是代码变化还是环境变化。

因此，这个项目最终选择把截图测试定位为本地视觉迭代工具，而不是默认 CI 合并门槛。AI agent 或开发者在本地用截图快速对齐 UI，CI 则专注验证稳定的功能行为。

推荐做法：

- CI 跑 lint、typecheck、unit tests 和功能 e2e，避免像素级截图断言影响 PR 稳定性。
- 本地保留 `pnpm e2e` 截图断言，用于 AI agent 迭代视觉还原。
- 有意修改 UI 时，在本地用 `pnpm e2e --update-snapshots` 更新快照。
- 如果团队需要把视觉回归作为强门槛，应单独建设固定 visual job，例如 pinned Docker 镜像或统一 runner，并只允许从这个环境更新截图基线。
- 不要把“本机截图通过”当成跨平台视觉一致的证明。

## CI 与视觉测试策略

当前项目采用分层策略：

```text
CI:    stable behavior checks, no screenshot assertions
Local: behavior checks + screenshot assertions for visual iteration
```

## Design Reference

The Todo UI follows this design, including the default list, empty state, and disabled add-button state for blank input.

![Todo app design](./public/todo-app-design.png)

## App Features

- Chinese Todo interface matching the provided design
- Default task list with active and completed items
- Add todos by button click or Enter key
- Toggle completion state
- Delete individual todos
- Filter by `全部`, `待办`, and `已完成`
- Live summary of active and completed counts
- Local Playwright screenshot coverage for visual fidelity

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Language | TypeScript 6 |
| Bundler | Vite 8 |
| Package Manager | pnpm |
| Unit Testing | Vitest + React Testing Library |
| E2E Testing | Playwright functional flows + local screenshot snapshots |
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
| `pnpm e2e` | Run Playwright e2e tests (auto-starts dev server; local runs include screenshots) |
| `pnpm verify` | **Full pipeline:** lint → typecheck → test → e2e |

## Project Structure

```
harness-react-demo/
├── e2e/                    # Playwright e2e tests
│   ├── todo.spec.ts        #   Todo app e2e test suite
│   └── todo.spec.ts-snapshots/
│       ├── todo-default-darwin.png
│       └── todo-empty-darwin.png
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

The e2e suite covers the main user flows and includes a local screenshot assertion for the default Todo screen.

```bash
pnpm e2e

# Update visual snapshots after intentional UI changes
pnpm e2e --update-snapshots
```

When `CI=true`, screenshot assertions are skipped. CI still runs the same functional e2e flows, but avoids pixel-level visual checks. Even a one-pixel difference can fail a snapshot on GitHub Actions while the UI is functionally unchanged.

For agent or developer visual iteration, use local screenshots as a fast feedback loop:

```bash
pnpm e2e
pnpm e2e --update-snapshots
```

Treat those snapshots as development aids unless the team standardizes a fixed visual test environment. If visual regression testing should become a shared merge gate, run it in one reproducible environment and update snapshots only from that environment.

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

Runs lint, typecheck, unit tests, and e2e tests. In CI, e2e tests skip screenshot assertions and focus on stable behavior checks.

## Adding New Code

1. Create or update the component and its CSS.
2. Add or update a nearby `*.test.tsx` unit test.
3. Add or update a Playwright spec in `e2e/` for full-page behavior.
4. Update screenshot snapshots when the visual change is intentional.
5. Run `pnpm verify` before committing.

---

Scaffolded with `pnpm create vite` using the `react-ts` template.
