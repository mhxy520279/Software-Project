import type { Task } from '../types/task'

const STORAGE_KEY = 'vibe-coding-runoob-tasks'

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Task[]
  } catch {
    return []
  }
}
