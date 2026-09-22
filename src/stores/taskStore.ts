import { reactive, watch } from 'vue'
import type { Task } from '../types/task'
import { saveTasks, loadTasks } from '../utils/storage'

const defaultTasks: Task[] = [
  { id: '1', title: '学习 Vue 3 Composition API', description: '掌握 ref、reactive、computed 的使用', status: 'todo', priority: 'high', dueDate: '2026-10-01', createdAt: new Date().toISOString() },
  { id: '2', title: '配置 Tailwind CSS', description: '完成项目样式搭建', status: 'in-progress', priority: 'medium', dueDate: '2026-10-05', createdAt: new Date().toISOString() },
  { id: '3', title: '实现数据持久化', description: '使用 localStorage 保存任务数据', status: 'todo', priority: 'low', dueDate: '2026-10-10', createdAt: new Date().toISOString() },
]

const state = reactive<{ tasks: Task[] }>({
  tasks: loadTasks().length > 0 ? loadTasks() : defaultTasks,
})

watch(
  () => state.tasks,
  (val) => saveTasks(val),
  { deep: true }
)

export function addTask(task: Task) {
  state.tasks.unshift(task)
}

export function updateTask(id: string, updates: Partial<Task>) {
  const idx = state.tasks.findIndex(t => t.id === id)
  if (idx !== -1) Object.assign(state.tasks[idx], updates)
}

export function deleteTask(id: string) {
  const idx = state.tasks.findIndex(t => t.id === id)
  if (idx !== -1) state.tasks.splice(idx, 1)
}

export function toggleTaskStatus(id: string) {
  const task = state.tasks.find(t => t.id === id)
  if (!task) return
  const cycle: Record<string, string> = { todo: 'in-progress', 'in-progress': 'done', done: 'todo' }
  task.status = cycle[task.status] as Task['status']
}

export const taskStore = {
  tasks: state.tasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
}
