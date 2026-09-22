import type { Task, TaskStatus, TaskPriority } from '../types/task'

export const STORAGE_KEY = 'vibe-coding-runoob-tasks'

const STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done']
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidTask(value: unknown): value is Task {
  if (!isRecord(value)) return false
  if (typeof value.id !== 'string' || value.id === '') return false
  if (typeof value.title !== 'string' || value.title === '') return false
  if (typeof value.status !== 'string' || !STATUSES.includes(value.status as TaskStatus)) return false
  if (typeof value.priority !== 'string' || !PRIORITIES.includes(value.priority as TaskPriority)) return false
  return true
}

function normalizeTask(task: Task): Task {
  return {
    id: task.id,
    title: task.title,
    description: typeof task.description === 'string' ? task.description : '',
    status: task.status,
    priority: task.priority,
    dueDate: typeof task.dueDate === 'string' ? task.dueDate : '',
    createdAt: typeof task.createdAt === 'string' ? task.createdAt : '',
  }
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidTask).map(normalizeTask)
  } catch {
    return []
  }
}
