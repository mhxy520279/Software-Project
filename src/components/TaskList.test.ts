import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskList from './TaskList.vue'
import TaskCard from './TaskCard.vue'
import type { Task } from '../types/task'

function makeTask(id: string, title: string, status: Task['status'], createdAt: string): Task {
  return {
    id,
    title,
    description: '',
    status,
    priority: 'medium',
    dueDate: '',
    createdAt,
  }
}

describe('TaskList', () => {
  it('按创建时间倒序渲染任务', () => {
    const tasks = [
      makeTask('1', '早任务', 'todo', '2026-09-20T00:00:00.000Z'),
      makeTask('2', '晚任务', 'todo', '2026-09-21T00:00:00.000Z'),
    ]
    const wrapper = mount(TaskList, { props: { tasks } })
    const titles = wrapper.findAllComponents(TaskCard).map(c => c.props('task').title)
    expect(titles).toEqual(['晚任务', '早任务'])
  })

  it('筛选按钮按状态过滤任务', async () => {
    const tasks = [
      makeTask('1', '待办任务', 'todo', '2026-09-20T00:00:00.000Z'),
      makeTask('2', '完成任务', 'done', '2026-09-21T00:00:00.000Z'),
    ]
    const wrapper = mount(TaskList, { props: { tasks } })
    const doneBtn = wrapper.findAll('button').find(b => b.text() === '已完成')
    await doneBtn.trigger('click')
    const titles = wrapper.findAllComponents(TaskCard).map(c => c.props('task').title)
    expect(titles).toEqual(['完成任务'])
  })

  it('tasks 未传或为空时显示空状态', () => {
    const wrapper = mount(TaskList, { props: { tasks: [] } })
    expect(wrapper.text()).toContain('还没有任务')
    const undefinedWrapper = mount(TaskList, { props: { tasks: undefined } })
    expect(undefinedWrapper.text()).toContain('还没有任务')
  })

  it('转发 toggle 与 delete 事件', () => {
    const tasks = [makeTask('1', '任务', 'todo', '2026-09-20T00:00:00.000Z')]
    const wrapper = mount(TaskList, { props: { tasks } })
    const card = wrapper.findComponent(TaskCard)
    card.vm.$emit('toggle', '1')
    card.vm.$emit('delete', '1')
    expect(wrapper.emitted('toggle')[0]).toEqual(['1'])
    expect(wrapper.emitted('delete')[0]).toEqual(['1'])
  })
})
