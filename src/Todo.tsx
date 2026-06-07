import { useState } from 'react'

interface TodoItem {
  id: number
  text: string
  completed: boolean
}

let nextId = 1

export default function Todo() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [input, setInput] = useState('')

  function addTodo() {
    const text = input.trim()
    if (!text) return
    setTodos((prev) => [...prev, { id: nextId++, text, completed: false }])
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

  return (
    <div className="todo-app">
      <h1>Todo</h1>
      <div className="todo-input-row">
        <input
          type="text"
          placeholder="Add a new todo..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
        />
        <button type="button" onClick={addTodo}>
          Add
        </button>
      </div>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span>{todo.text}</span>
            </label>
            <button
              type="button"
              className="delete-btn"
              onClick={() => deleteTodo(todo.id)}
            >
              Delete
            </button>
          </li>
        ))}
        {todos.length === 0 && (
          <li className="empty-state">No todos yet. Add one above!</li>
        )}
      </ul>
    </div>
  )
}
