import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import Todo from './Todo'

afterEach(cleanup)
beforeEach(() => {
  window.localStorage.clear()
})

function renderTodo() {
  render(<Todo />)
}

describe('Todo', () => {
  it('renders an empty todo list by default', () => {
    renderTodo()

    expect(screen.getByRole('heading', { name: 'Todo' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('添加新的待办事项...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '添加' })).toBeDisabled()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByRole('status')).toHaveTextContent('还没有待办事项')
    expect(screen.queryByText(/共 \d+ 条待办/)).not.toBeInTheDocument()
  })

  it('enables the add button only when the input has content', () => {
    renderTodo()
    const input = screen.getByPlaceholderText('添加新的待办事项...')
    const addButton = screen.getByRole('button', { name: '添加' })

    expect(addButton).toBeDisabled()

    fireEvent.change(input, { target: { value: '   ' } })
    expect(addButton).toBeDisabled()

    fireEvent.change(input, { target: { value: '整理会议纪要' } })
    expect(addButton).toBeEnabled()

    fireEvent.click(addButton)
    expect(addButton).toBeDisabled()
  })

  it('adds a todo when typing and clicking add', () => {
    renderTodo()
    const input = screen.getByPlaceholderText('添加新的待办事项...')

    fireEvent.change(input, { target: { value: '整理会议纪要' } })
    fireEvent.click(screen.getByRole('button', { name: '添加' }))

    expect(screen.getByText('整理会议纪要')).toBeInTheDocument()
    expect(screen.getByText('共 1 条待办，已完成 0 条')).toBeInTheDocument()
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

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByRole('status')).toHaveTextContent('还没有待办事项')
  })

  it('toggles a todo as completed and updates the summary', () => {
    renderTodo()
    fireEvent.change(screen.getByPlaceholderText('添加新的待办事项...'), {
      target: { value: '学习 React' },
    })
    fireEvent.click(screen.getByRole('button', { name: '添加' }))
    const checkbox = screen.getByRole('checkbox', { name: '标记为完成：学习 React' })

    expect(checkbox).not.toBeChecked()
    fireEvent.click(checkbox)

    expect(checkbox).toBeChecked()
    expect(screen.getByText('共 0 条待办，已完成 1 条')).toBeInTheDocument()
  })

  it('filters active and completed todos', () => {
    renderTodo()
    fireEvent.change(screen.getByPlaceholderText('添加新的待办事项...'), {
      target: { value: '学习 React' },
    })
    fireEvent.click(screen.getByRole('button', { name: '添加' }))
    fireEvent.change(screen.getByPlaceholderText('添加新的待办事项...'), {
      target: { value: '完成设计稿' },
    })
    fireEvent.click(screen.getByRole('button', { name: '添加' }))
    fireEvent.click(screen.getByRole('checkbox', { name: '标记为完成：完成设计稿' }))

    fireEvent.click(screen.getByRole('tab', { name: '待办' }))
    expect(screen.getByText('学习 React')).toBeInTheDocument()
    expect(screen.queryByText('完成设计稿')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: '已完成' }))
    expect(screen.getByText('完成设计稿')).toBeInTheDocument()
    expect(screen.queryByText('去跑步')).not.toBeInTheDocument()
  })

  it('deletes a todo', () => {
    renderTodo()
    fireEvent.change(screen.getByPlaceholderText('添加新的待办事项...'), {
      target: { value: '去跑步' },
    })
    fireEvent.click(screen.getByRole('button', { name: '添加' }))

    expect(screen.getByText('去跑步')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '删除 去跑步' }))

    expect(screen.queryByText('去跑步')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('还没有待办事项')
  })

  it('persists added, toggled, and deleted todos in localStorage', () => {
    renderTodo()

    fireEvent.change(screen.getByPlaceholderText('添加新的待办事项...'), {
      target: { value: '重新开始' },
    })
    fireEvent.click(screen.getByRole('button', { name: '添加' }))
    fireEvent.change(screen.getByPlaceholderText('添加新的待办事项...'), {
      target: { value: '临时事项' },
    })
    fireEvent.click(screen.getByRole('button', { name: '添加' }))
    fireEvent.click(screen.getByRole('checkbox', { name: '标记为完成：重新开始' }))
    fireEvent.click(screen.getByRole('button', { name: '删除 临时事项' }))

    expect(window.localStorage.getItem('harness-react-demo:todos')).toBe(
      JSON.stringify([{ id: 1, text: '重新开始', completed: true }]),
    )
  })

  it('loads todos from localStorage', () => {
    window.localStorage.setItem(
      'harness-react-demo:todos',
      JSON.stringify([{ id: 7, text: '继续昨天的任务', completed: true }]),
    )

    renderTodo()

    expect(screen.getByText('继续昨天的任务')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '标记为待办：继续昨天的任务' })).toBeChecked()
    expect(screen.getByText('共 0 条待办，已完成 1 条')).toBeInTheDocument()
  })
})
