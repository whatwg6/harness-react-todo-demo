import { useEffect, useState } from 'react'

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
  const canAddTodo = input.trim().length > 0

  return (
    <div className="mx-auto my-4 box-border min-h-[calc(100vh-32px)] w-full max-w-[1160px] rounded-[22px] border border-[#e2e8f0] bg-white px-5 py-11 text-[#111827] shadow-[0_22px_52px_rgba(15,23,42,0.14)] md:my-[63px] md:min-h-[80vh] md:rounded-[28px] md:px-[60px] md:pt-[84px] md:pb-[89px]">
      <h1 className="mt-0 mb-9 text-[48px] leading-none font-extrabold tracking-normal md:mb-[72px] md:text-[64px]">
        Todo
      </h1>
      <div className="mb-11 grid grid-cols-1 gap-3.5 md:mb-[82px] md:grid-cols-[minmax(0,1fr)_240px] md:gap-[34px]">
        <input
          type="text"
          placeholder="添加新的待办事项..."
          value={input}
          className="h-[68px] min-w-0 rounded-[14px] border-2 border-[#d1d5db] bg-white px-5 text-[22px] leading-[1.2] text-[#111827] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:shadow-[0_0_0_5px_rgba(37,99,235,0.16)] md:h-[124px] md:px-[38px] md:text-[34px]"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
        />
        <button
          type="button"
          className="inline-flex h-[68px] min-w-0 cursor-pointer items-center justify-center gap-6 rounded-[14px] border-0 bg-[#2563eb] text-[22px] leading-[1.2] font-bold text-white shadow-[0_14px_26px_rgba(37,99,235,0.22)] transition-[background,transform,box-shadow] duration-150 hover:-translate-y-px hover:bg-[#1d4ed8] hover:shadow-[0_18px_30px_rgba(37,99,235,0.26)] active:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#edf1f7] disabled:text-[#9ca3af] disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:bg-[#edf1f7] disabled:hover:shadow-none md:h-[124px] md:text-[34px]"
          onClick={addTodo}
          disabled={!canAddTodo}
        >
          <span className="text-[34px] leading-none font-light md:text-[52px]" aria-hidden="true">
            +
          </span>
          添加
        </button>
      </div>

      <div
        className="mb-[30px] grid grid-cols-3 border-b border-[#e5e7eb] md:mb-12"
        role="tablist"
        aria-label="待办筛选"
      >
        {filters.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={filter === option.id}
            className="relative h-14 cursor-pointer border-0 bg-transparent text-[21px] leading-[1.2] text-[#6b7280] after:absolute after:right-0 after:-bottom-px after:left-0 after:h-[5px] after:bg-transparent after:content-[''] aria-selected:text-[#2563eb] aria-selected:after:bg-[#2563eb] md:h-[74px] md:text-[34px]"
            onClick={() => setFilter(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visibleTodos.length > 0 ? (
        <ul className="m-0 grid list-none gap-[18px] p-0">
          {visibleTodos.map((todo) => (
            <li
              key={todo.id}
              className="flex min-h-[86px] items-center justify-between rounded-xl border border-[#e5e7eb] bg-white px-[18px] md:min-h-[152px] md:pr-[58px] md:pl-[34px]"
            >
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-[18px] text-[22px] leading-[1.2] text-[#111827] md:gap-12 md:text-4xl">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  className="todo-checkbox"
                  onChange={() => toggleTodo(todo.id)}
                  aria-label={`${todo.completed ? '标记为待办' : '标记为完成'}：${todo.text}`}
                />
                <span
                  className={`min-w-0 text-left break-anywhere ${
                    todo.completed ? 'text-[#8b929d] line-through decoration-2' : ''
                  }`}
                >
                  {todo.text}
                </span>
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
        <div
          className="grid min-h-[260px] justify-items-center px-4 pt-7 pb-6 md:min-h-[342px] md:px-6 md:pt-[46px] md:pb-[34px]"
          role="status"
          aria-live="polite"
        >
          <div className="todo-empty-illustration" aria-hidden="true">
            <div className="todo-empty-board">
              <span className="todo-empty-eye" />
              <span className="todo-empty-eye" />
            </div>
            <span className="todo-empty-spark todo-empty-spark-one">+</span>
            <span className="todo-empty-spark todo-empty-spark-two">+</span>
            <span className="todo-empty-dot" />
          </div>
          <p className="mb-[13px] text-2xl leading-tight font-medium text-[#111827] md:text-[32px]">
            还没有待办事项
          </p>
          <p className="text-lg leading-[1.35] text-[#8b929d] md:text-[23px]">快去添加一条吧 ～</p>
        </div>
      )}

      {todos.length > 0 && (
        <p className="mt-9 text-xl leading-[1.3] text-[#9ca3af] md:mt-16 md:text-[31px]">
          共 {activeCount} 条待办，已完成 {completedCount} 条
        </p>
      )}
    </div>
  )
}
