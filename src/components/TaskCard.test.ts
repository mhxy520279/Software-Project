import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskCard from './TaskCard.vue'
import type { Task } from '../types/task'

function makeTask(overrides = {}): Task {
  return {
    id: '1',
    title: '测试任务',
    description: '测试描述',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-10-01',
    createdAt: '2026-09-22T00:00:00.000Z',
    ...overrides,
  }
}

describe('TaskCard', () => {
  it('渲染标题、描述、优先级与截止日期', () => {
    const wrapper = mount(TaskCard, { props: { task: makeTask() } })
    expect(wrapper.text()).toContain('测试任务')
    expect(wrapper.text()).toContain('测试描述')
    expect(wrapper.text()).toContain('高')
    expect(wrapper.text()).toContain('2026-10-01')
  })

  it('勾选复选框触发 toggle 事件', async () => {
    const wrapper = mount(TaskCard, { props: { task: makeTask() } })
    await wrapper.find('input[type="checkbox"]').setValue(true)
    expect(wrapper.emitted('toggle')[0]).toEqual(['1'])
  })

  it('点击删除按钮触发 delete 且不触发 toggle', async () => {
    const wrapper = mount(TaskCard, { props: { task: makeTask() } })
    await wrapper.find('button[title="删除任务"]').trigger('click')
    expect(wrapper.emitted('delete')[0]).toEqual(['1'])
    expect(wrapper.emitted('toggle')).toBeUndefined()
  })

  it('已完成任务标题带删除线且复选框已选中', () => {
    const wrapper = mount(TaskCard, { props: { task: makeTask({ status: 'done' }) } })
    expect(wrapper.find('h3').classes()).toContain('line-through')
    expect(wrapper.find('input[type="checkbox"]').element.checked).toBe(true)
  })
})
