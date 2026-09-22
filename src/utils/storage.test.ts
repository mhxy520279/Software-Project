import { describe, it, expect, beforeEach } from 'vitest'
import type { Task } from '../types/task'
import { STORAGE_KEY, saveTasks, loadTasks } from './storage'

const task: Task = {
  id: '1',
  title: '测试任务',
  description: '测试描述',
  status: 'todo',
  priority: 'high',
  dueDate: '2026-10-01',
  createdAt: '2026-09-22T00:00:00.000Z',
}

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('保存后可完整读取', () => {
    saveTasks([task])
    expect(loadTasks()).toEqual([task])
  })

  it('无数据时返回空数组', () => {
    expect(loadTasks()).toEqual([])
  })

  it('存储的不是数组时返回空数组', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ a: 1 }))
    expect(loadTasks()).toEqual([])
  })

  it('损坏的 JSON 返回空数组而不抛异常', () => {
    localStorage.setItem(STORAGE_KEY, '{broken json')
    expect(loadTasks()).toEqual([])
  })
})
