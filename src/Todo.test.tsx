import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import Todo from './Todo'

afterEach(cleanup)

function renderTodo() {
  render(<Todo />)
}

describe('Todo', () => {
  it('renders the redesigned default todo list', () => {
    renderTodo()

    expect(screen.getByRole('heading', { name: 'Todo' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('添加新的待办事项...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '添加' })).toBeInTheDocument()
    expect(screen.getByText('学习 React')).toBeInTheDocument()
    expect(screen.getByText('学习 TypeScript')).toBeInTheDocument()
    expect(screen.getByText('共 3 条待办，已完成 2 条')).toBeInTheDocument()
  })

  it('adds a todo when typing and clicking add', () => {
    renderTodo()
    const input = screen.getByPlaceholderText('添加新的待办事项...')

    fireEvent.change(input, { target: { value: '整理会议纪要' } })
    fireEvent.click(screen.getByRole('button', { name: '添加' }))

    expect(screen.getByText('整理会议纪要')).toBeInTheDocument()
    expect(screen.getByText('共 4 条待办，已完成 2 条')).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('adds a todo when pressing Enter', () => {
    renderTodo()
    const input = screen.getByPlaceholderText('添加新的待办事项...')

    fireEvent.change(input, { target: { value: '写周报' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.getByText('写周报')).toBeInTheDocument()
  })

  it('does not add blank todos', () => {
    renderTodo()
    fireEvent.change(screen.getByPlaceholderText('添加新的待办事项...'), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByRole('button', { name: '添加' }))

    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    expect(screen.getByText('共 3 条待办，已完成 2 条')).toBeInTheDocument()
  })

  it('toggles a todo as completed and updates the summary', () => {
    renderTodo()
    const checkbox = screen.getByRole('checkbox', { name: '标记为完成：学习 React' })

    expect(checkbox).not.toBeChecked()
    fireEvent.click(checkbox)

    expect(checkbox).toBeChecked()
    expect(screen.getByText('共 2 条待办，已完成 3 条')).toBeInTheDocument()
  })

  it('filters active and completed todos', () => {
    renderTodo()

    fireEvent.click(screen.getByRole('tab', { name: '待办' }))
    expect(screen.getByText('学习 React')).toBeInTheDocument()
    expect(screen.queryByText('完成设计稿')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: '已完成' }))
    expect(screen.getByText('完成设计稿')).toBeInTheDocument()
    expect(screen.queryByText('去跑步')).not.toBeInTheDocument()
  })

  it('deletes a todo', () => {
    renderTodo()

    expect(screen.getByText('去跑步')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '删除 去跑步' }))

    expect(screen.queryByText('去跑步')).not.toBeInTheDocument()
    expect(screen.getByText('共 2 条待办，已完成 2 条')).toBeInTheDocument()
  })
})
