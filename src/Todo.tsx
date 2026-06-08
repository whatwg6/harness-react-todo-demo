import { useEffect, useState } from 'react'
import './Todo.css'

interface TodoItem {
  id: number
  text: string
  completed: boolean
}

type TodoFilter = 'all' | 'active' | 'completed'

interface FilterOption {
  id: TodoFilter
  label: string
}

const filters: FilterOption[] = [
  { id: 'all', label: '全部' },
  { id: 'active', label: '待办' },
  { id: 'completed', label: '已完成' },
]

const todoStorageKey = 'harness-react-demo:todos'

function isTodoItem(value: unknown): value is TodoItem {
  if (typeof value !== 'object' || value === null) return false
  const todo = value as Record<string, unknown>
  return (
    typeof todo.id === 'number' &&
    Number.isFinite(todo.id) &&
    typeof todo.text === 'string' &&
    typeof todo.completed === 'boolean'
  )
}

function readStoredTodos(): TodoItem[] {
  const storedTodos = window.localStorage.getItem(todoStorageKey)
  if (!storedTodos) return []

  try {
    const parsedTodos: unknown = JSON.parse(storedTodos)
    return Array.isArray(parsedTodos) && parsedTodos.every(isTodoItem)
      ? parsedTodos
      : []
  } catch {
    return []
  }
}

export default function Todo() {
  const [todos, setTodos] = useState<TodoItem[]>(readStoredTodos)
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<TodoFilter>('all')

  useEffect(() => {
    window.localStorage.setItem(todoStorageKey, JSON.stringify(todos))
  }, [todos])

  function addTodo() {
    const text = input.trim()
    if (!text) return
    setTodos((prev) => {
      const nextId = Math.max(0, ...prev.map((todo) => todo.id)) + 1
      return [...prev, { id: nextId, text, completed: false }]
    })
    setInput('')
  }

  function toggleTodo(id: number) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )
  }

  function deleteTodo(id: number) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  const visibleTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const completedCount = todos.filter((todo) => todo.completed).length
  const activeCount = todos.length - completedCount

  return (
    <div className="todo-app">
      <h1>Todo</h1>
      <div className="todo-input-row">
        <input
          type="text"
          placeholder="添加新的待办事项..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
        />
        <button type="button" onClick={addTodo}>
          <span className="todo-add-icon" aria-hidden="true">
            +
          </span>
          添加
        </button>
      </div>

      <div className="todo-filters" role="tablist" aria-label="待办筛选">
        {filters.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={filter === option.id}
            className={filter === option.id ? 'active' : ''}
            onClick={() => setFilter(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visibleTodos.length > 0 ? (
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <li key={todo.id} className={todo.completed ? 'completed' : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  aria-label={`${todo.completed ? '标记为待办' : '标记为完成'}：${todo.text}`}
                />
                <span>{todo.text}</span>
              </label>
              <button
                type="button"
                className="delete-btn"
                aria-label={`删除 ${todo.text}`}
                onClick={() => deleteTodo(todo.id)}
              >
                <span aria-hidden="true" className="delete-icon" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="todo-empty-state" role="status" aria-live="polite">
          <div className="todo-empty-illustration" aria-hidden="true">
            <div className="todo-empty-board">
              <span className="todo-empty-eye" />
              <span className="todo-empty-eye" />
            </div>
            <span className="todo-empty-spark todo-empty-spark-one">+</span>
            <span className="todo-empty-spark todo-empty-spark-two">+</span>
            <span className="todo-empty-dot" />
          </div>
          <p className="todo-empty-title">还没有待办事项</p>
          <p className="todo-empty-text">快去添加一条吧 ～</p>
        </div>
      )}

      {todos.length > 0 && (
        <p className="todo-summary">
          共 {activeCount} 条待办，已完成 {completedCount} 条
        </p>
      )}
    </div>
  )
}
