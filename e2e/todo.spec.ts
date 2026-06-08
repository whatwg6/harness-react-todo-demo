import { test, expect } from '@playwright/test'

async function addTodo(page: import('@playwright/test').Page, todo: string) {
  await page.getByPlaceholder('添加新的待办事项...').fill(todo)
  await page.getByRole('button', { name: '添加' }).click()
}

test.describe('Todo App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
  })

  test('matches the todo app design with no default content', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Todo' })).toBeVisible()
    await expect(page.getByPlaceholder('添加新的待办事项...')).toBeVisible()
    await expect(page.getByRole('button', { name: '添加' })).toBeVisible()
    await expect(page.getByRole('tab', { name: '全部' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByRole('status')).toContainText('还没有待办事项')
    await expect(page.getByText('快去添加一条吧 ～')).toBeVisible()
    await expect(page.getByText(/共 \d+ 条待办/)).not.toBeVisible()
    await expect(page).toHaveScreenshot('todo-empty.png', {
      fullPage: true,
    })
  })

  test('adds a todo via the input and add button', async ({ page }) => {
    const input = page.getByPlaceholder('添加新的待办事项...')
    await input.fill('整理会议纪要')
    await page.getByRole('button', { name: '添加' }).click()

    await expect(page.getByText('整理会议纪要')).toBeVisible()
    await expect(page.getByText('共 1 条待办，已完成 0 条')).toBeVisible()
    await expect(input).toHaveValue('')
  })

  test('adds a todo by pressing Enter', async ({ page }) => {
    await page.getByPlaceholder('添加新的待办事项...').fill('写周报')
    await page.getByPlaceholder('添加新的待办事项...').press('Enter')
    await expect(page.getByText('写周报')).toBeVisible()
  })

  test('filters active and completed todos', async ({ page }) => {
    await addTodo(page, '学习 React')
    await addTodo(page, '完成设计稿')
    await page.getByRole('checkbox', { name: '标记为完成：完成设计稿' }).check()

    await page.getByRole('tab', { name: '待办' }).click()
    await expect(page.getByRole('tab', { name: '待办' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByText('学习 React')).toBeVisible()
    await expect(page.getByText('完成设计稿')).not.toBeVisible()

    await page.getByRole('tab', { name: '已完成' }).click()
    await expect(page.getByText('完成设计稿')).toBeVisible()
    await expect(page.getByText('去跑步')).not.toBeVisible()
  })

  test('toggles and deletes todos', async ({ page }) => {
    await addTodo(page, '学习 React')
    await addTodo(page, '去跑步')

    await page.getByRole('checkbox', { name: '标记为完成：学习 React' }).check()
    await expect(page.getByText('共 1 条待办，已完成 1 条')).toBeVisible()

    await page.getByRole('button', { name: '删除 去跑步' }).click()
    await expect(page.getByText('去跑步')).not.toBeVisible()
    await expect(page.getByText('共 0 条待办，已完成 1 条')).toBeVisible()
  })

  test('shows the empty state when no todos remain', async ({ page }) => {
    await addTodo(page, '重新开始')
    await page.getByRole('button', { name: '删除 重新开始' }).click()

    await expect(page.getByRole('status')).toContainText('还没有待办事项')
    await expect(page.getByText('快去添加一条吧 ～')).toBeVisible()
    await expect(page.getByText(/共 \d+ 条待办/)).not.toBeVisible()

    await page.getByPlaceholder('添加新的待办事项...').fill('重新开始')
    await page.getByRole('button', { name: '添加' }).click()
    await expect(page.getByText('重新开始')).toBeVisible()
    await expect(page.getByText('共 1 条待办，已完成 0 条')).toBeVisible()
  })

  test('persists todos in localStorage after reload', async ({ page }) => {
    await addTodo(page, '继续昨天的任务')
    await page.getByRole('checkbox', { name: '标记为完成：继续昨天的任务' }).check()
    await page.reload()

    await expect(page.getByText('继续昨天的任务')).toBeVisible()
    await expect(
      page.getByRole('checkbox', { name: '标记为待办：继续昨天的任务' }),
    ).toBeChecked()
    await expect(page.getByText('共 0 条待办，已完成 1 条')).toBeVisible()
  })
})
