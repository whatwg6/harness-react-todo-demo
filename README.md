# Harness React Todo

一个 React + TypeScript + Vite Todo 页面实现，用来验证 AI 是否能根据视觉参考完成代码还原。项目本身很小，但配了一套完整 harness：lint、typecheck、unit tests、Playwright e2e、本地截图回归，以及一个 `pnpm verify` 命令。

## 项目背景与经验总结

这个项目用于验证 AI 根据视觉参考还原前端页面时，如何结合 Playwright 做本地视觉迭代和 CI 校验。

实践中发现，Playwright 截图测试不适合作为默认 CI 门槛：

- Playwright 截图基线按平台区分，例如 `*-darwin.png` 和 `*-linux.png` 不能混用。
- CI 和本机即使用同类系统，也可能因为 runner 镜像、Chromium patch、字体渲染、抗锯齿和子像素差异导致 1 像素失败。
- `maxDiffPixels` 只能缓解轻微抖动，不能根治环境差异；阈值过大还会削弱视觉回归价值。
- CI 安装 Chromium 有额外耗时，Ubuntu 需要 `--with-deps`，macOS runner 成本更高。
- 团队成员机器不同，不能随意提交各自生成的截图基线，否则很难判断差异来自代码还是环境。

因此当前策略是：

```text
CI:    lint + typecheck + unit tests + 功能 e2e，不跑截图断言
Local: 功能 e2e + 截图断言，用于 AI/开发者视觉迭代
```

从 0 还原设计稿时，Playwright baseline 也不能一开始就生成。第一张实现截图只是当前实现，不是设计真相。正确流程是：

```text
设计参考图 / 设计稿
        ↓
AI 实现页面
        ↓
Playwright 截取当前页面
        ↓
对比“当前截图 vs 设计参考”
        ↓
继续调整布局、尺寸、间距、颜色和状态
        ↓
验收后再生成 Playwright snapshot
        ↓
后续用 snapshot 防回归
```

让 agent 自己迭代视觉还原时，prompt 应该明确三件事：

- 参考源：设计图、截图尺寸、浏览器、设备像素比、字体和可用资源。
- 对比方式：每轮用 Playwright 截图，并和参考图比较布局、尺寸、间距、颜色、字体、状态和溢出问题。
- 终止条件：先达到人工认可或可接受误差，再更新 snapshot；不要把首次实现截图直接当 baseline。

结论：截图测试适合做本地视觉反馈和已验收页面的防回归；如果要作为团队级合并门槛，必须建设固定 visual 环境，例如 pinned Docker 镜像或专门 CI visual job，并只从该环境更新截图基线。

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
