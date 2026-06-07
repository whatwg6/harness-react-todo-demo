import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import Todo from './Todo'

afterEach(cleanup)

function renderTodo() {
  render(<Todo />)
}

describe('Todo', () => {
  it('shows empty state initially', () => {
    renderTodo()
    expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument()
  })

  it('adds a todo when typing and clicking Add', () => {
    renderTodo()
    const input = screen.getByPlaceholderText('Add a new todo...')
    fireEvent.change(input, { target: { value: 'Buy milk' } })
    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
    expect(screen.queryByText('No todos yet. Add one above!')).not.toBeInTheDocument()
  })

  it('adds a todo when pressing Enter', () => {
    renderTodo()
    const input = screen.getByPlaceholderText('Add a new todo...')
    fireEvent.change(input, { target: { value: 'Write code' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('Write code')).toBeInTheDocument()
  })

  it('does not add empty todos', () => {
    renderTodo()
    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument()
  })

  it('toggles a todo as completed', () => {
    renderTodo()
    const input = screen.getByPlaceholderText('Add a new todo...')
    fireEvent.change(input, { target: { value: 'Learn React' } })
    fireEvent.click(screen.getByText('Add'))

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()

    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('deletes a todo', () => {
    renderTodo()
    const input = screen.getByPlaceholderText('Add a new todo...')
    fireEvent.change(input, { target: { value: 'Delete me' } })
    fireEvent.click(screen.getByText('Add'))

    expect(screen.getByText('Delete me')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Delete'))
    expect(screen.queryByText('Delete me')).not.toBeInTheDocument()
    expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument()
  })

  it('clears input after adding a todo', () => {
    renderTodo()
    const input = screen.getByPlaceholderText('Add a new todo...')
    fireEvent.change(input, { target: { value: 'Clear input' } })
    fireEvent.click(screen.getByText('Add'))
    expect(input).toHaveValue('')
  })
})
