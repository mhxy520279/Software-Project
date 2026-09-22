import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Task } from '../types/task'

const STORAGE_KEY = 'vibe-coding-runoob-tasks'

function newTask(overrides = {}): Task {
  return {
    id: '99',
    title: '新任务',
    description: '',
    status: 'todo',
    priority: 'low',
    dueDate: '',
    createdAt: '2026-09-22T01:00:00.000Z',
    ...overrides,
  }
}

// 每个测试重新加载模块，隔离 taskStore 模块级单例
async function importStore() {
  vi.resetModules()
  return await import('./taskStore')
}

describe('taskStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('无持久化数据时使用 3 个默认任务', async () => {
    const { taskStore } = await importStore()
    expect(taskStore.tasks.length).toBe(3)
    expect(taskStore.tasks[0].title).toContain('Vue 3')
  })

  it('有持久化数据时优先读取', async () => {
    const persisted = [newTask({ id: '7', title: '已保存任务' })]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
    const { taskStore } = await importStore()
    expect(taskStore.tasks.length).toBe(1)
    expect(taskStore.tasks[0].title).toBe('已保存任务')
  })

  it('模拟刷新：持久化数据重新加载后不丢失', async () => {
    const { addTask } = await importStore()
    addTask(newTask({ id: 'persist-1', title: '刷新也要在' }))
    // watch 异步触发持久化
    await new Promise(r => setTimeout(r, 0))

    // 模拟页面刷新：清空模块缓存后重新初始化应用
    const { taskStore: fresh } = await importStore()
    expect(fresh.tasks.some(t => t.id === 'persist-1')).toBe(true)
    expect(fresh.tasks[0].title).toBe('刷新也要在')
  })

  it('持久化数据不合法时回退到默认任务而不崩溃', async () => {
    localStorage.setItem(STORAGE_KEY, 'null')
    const { taskStore } = await importStore()
    expect(taskStore.tasks.length).toBe(3)
  })

  it('addTask 将新任务添加到列表头部并持久化', async () => {
    const { taskStore, addTask } = await importStore()
    addTask(newTask())
    expect(taskStore.tasks[0].title).toBe('新任务')
    // watch 异步触发持久化
    await new Promise(r => setTimeout(r, 0))
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored[0].title).toBe('新任务')
  })

  it('updateTask 更新指定字段', async () => {
    const { taskStore, updateTask } = await importStore()
    updateTask('1', { priority: 'low', title: '改标题' })
    const updated = taskStore.tasks.find(t => t.id === '1')
    expect(updated.priority).toBe('low')
    expect(updated.title).toBe('改标题')
  })

  it('deleteTask 删除指定任务', async () => {
    const { taskStore, deleteTask } = await importStore()
    deleteTask('2')
    expect(taskStore.tasks.find(t => t.id === '2')).toBeUndefined()
    expect(taskStore.tasks.length).toBe(2)
  })

  it('toggleTaskStatus 按 todo → in-progress → done → todo 循环', async () => {
    const { taskStore, toggleTaskStatus } = await importStore()
    toggleTaskStatus('1')
    expect(taskStore.tasks[0].status).toBe('in-progress')
    toggleTaskStatus('1')
    expect(taskStore.tasks[0].status).toBe('done')
    toggleTaskStatus('1')
    expect(taskStore.tasks[0].status).toBe('todo')
  })
})
