import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import KanbanBoard from './KanbanBoard.vue'
import TaskCard from './TaskCard.vue'
import type { Task } from '../types/task'

function makeTask(id: string, title: string, status: Task['status']): Task {
  return {
    id,
    title,
    description: '',
    status,
    priority: 'medium',
    dueDate: '',
    createdAt: '2026-09-20T00:00:00.000Z',
  }
}

function columnEl(wrapper, label: string) {
  return wrapper.findAll('.bg-gray-100').find(c => c.find('h3').text().includes(label)).element as HTMLElement
}

describe('KanbanBoard', () => {
  it('渲染待办 / 进行中 / 已完成三列', () => {
    const wrapper = mount(KanbanBoard, { props: { tasks: [] } })
    const text = wrapper.text()
    expect(text).toContain('待办')
    expect(text).toContain('进行中')
    expect(text).toContain('已完成')
  })

  it('按状态分组任务到对应列', () => {
    const tasks = [
      makeTask('1', '待办任务', 'todo'),
      makeTask('2', '另一个待办', 'todo'),
      makeTask('3', '进行中任务', 'in-progress'),
      makeTask('4', '完成任务', 'done'),
    ]
    const wrapper = mount(KanbanBoard, { props: { tasks } })
    const statuses = wrapper.findAllComponents(TaskCard).map(c => (c.props('task') as Task).status)
    expect(statuses).toEqual(['todo', 'todo', 'in-progress', 'done'])
    expect(columnEl(wrapper, '待办').querySelector('h3').textContent).toContain('2')
    expect(columnEl(wrapper, '进行中').querySelector('h3').textContent).toContain('1')
    expect(columnEl(wrapper, '已完成').querySelector('h3').textContent).toContain('1')
  })

  it('拖拽释放到目标列发出 move 事件（携带 taskId 与目标状态）', async () => {
    const wrapper = mount(KanbanBoard, {
      props: { tasks: [makeTask('1', '任务', 'todo')] },
    })
    const doneCol = columnEl(wrapper, '已完成')
    const evt = new window.Event('drop')
    Object.defineProperty(evt, 'dataTransfer', {
      value: { getData: (key: string) => (key === 'taskId' ? '1' : '') },
    })
    doneCol.dispatchEvent(evt)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('move')[0]).toEqual(['1', 'done'])
  })

  it('拖拽开始时把任务 id 写入 dataTransfer', async () => {
    const wrapper = mount(KanbanBoard, {
      props: { tasks: [makeTask('1', '任务', 'todo')] },
    })
    const dataTransfer = { setData: vi.fn(), getData: () => '' }
    const el = wrapper.findComponent(TaskCard).element.parentElement!
    const evt = new window.Event('dragstart')
    Object.defineProperty(evt, 'dataTransfer', { value: dataTransfer })
    el.dispatchEvent(evt)
    await wrapper.vm.$nextTick()
    expect(dataTransfer.setData).toHaveBeenCalledWith('taskId', '1')
  })

  it('空列显示拖拽提示', () => {
    const wrapper = mount(KanbanBoard, {
      props: { tasks: [makeTask('1', '任务', 'todo')] },
    })
    expect(columnEl(wrapper, '进行中').textContent).toContain('拖拽任务到此处')
  })
})
