import { test, expect } from '@playwright/test'

test.describe('Todo App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows empty state initially', async ({ page }) => {
    await expect(page.getByText('No todos yet. Add one above!')).toBeVisible()
  })

  test('adds a todo via the input and add button', async ({ page }) => {
    await page.getByPlaceholder('Add a new todo...').fill('Buy milk')
    await page.getByRole('button', { name: 'Add' }).click()
    await expect(page.getByText('Buy milk')).toBeVisible()
    await expect(
      page.getByText('No todos yet. Add one above!')
    ).not.toBeVisible()
  })

  test('adds a todo by pressing Enter', async ({ page }) => {
    await page.getByPlaceholder('Add a new todo...').fill('Write code')
    await page.getByPlaceholder('Add a new todo...').press('Enter')
    await expect(page.getByText('Write code')).toBeVisible()
  })

  test('does not add empty todos', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click()
    await expect(
      page.getByText('No todos yet. Add one above!')
    ).toBeVisible()
  })

  test('toggles a todo as completed', async ({ page }) => {
    await page.getByPlaceholder('Add a new todo...').fill('Learn React')
    await page.getByRole('button', { name: 'Add' }).click()

    const checkbox = page.getByRole('checkbox')
    await expect(checkbox).not.toBeChecked()

    await checkbox.check()
    await expect(checkbox).toBeChecked()

    await checkbox.uncheck()
    await expect(checkbox).not.toBeChecked()
  })

  test('deletes a todo', async ({ page }) => {
    await page.getByPlaceholder('Add a new todo...').fill('Delete me')
    await page.getByRole('button', { name: 'Add' }).click()
    await expect(page.getByText('Delete me')).toBeVisible()

    await page.getByRole('button', { name: 'Delete' }).click()
    await expect(page.getByText('Delete me')).not.toBeVisible()
    await expect(
      page.getByText('No todos yet. Add one above!')
    ).toBeVisible()
  })

  test('input clears after adding a todo', async ({ page }) => {
    const input = page.getByPlaceholder('Add a new todo...')
    await input.fill('Clear input')
    await page.getByRole('button', { name: 'Add' }).click()
    await expect(input).toHaveValue('')
  })
})
