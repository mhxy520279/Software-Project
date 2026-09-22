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

  it('存储为非数组的合法 JSON（null/数字/字符串/布尔）时返回空数组', () => {
    localStorage.setItem(STORAGE_KEY, 'null')
    expect(loadTasks()).toEqual([])
    localStorage.setItem(STORAGE_KEY, '42')
    expect(loadTasks()).toEqual([])
    localStorage.setItem(STORAGE_KEY, '"abc"')
    expect(loadTasks()).toEqual([])
    localStorage.setItem(STORAGE_KEY, 'true')
    expect(loadTasks()).toEqual([])
  })

  it('过滤非法任务元素，并保留合法元素且补齐可选字段', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        task,
        null,
        'garbage',
        { id: 'bad', title: '缺状态' },
        { id: '2', title: '合法任务', status: 'todo', priority: 'low' },
      ])
    )
    expect(loadTasks()).toEqual([
      task,
      { id: '2', title: '合法任务', status: 'todo', priority: 'low', description: '', dueDate: '', createdAt: '' },
    ])
  })

  it('过滤 status / priority 非法的任务元素', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { ...task, status: 'urgent' },
        { ...task, priority: 'critical' },
        { ...task, id: '' },
      ])
    )
    expect(loadTasks()).toEqual([])
  })
})
