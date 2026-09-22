import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskModal from './TaskModal.vue'

function findButton(wrapper, text: string) {
  return wrapper.findAll('button').find(b => b.text() === text)
}

describe('TaskModal', () => {
  it('空标题提交显示错误且不触发 submit', async () => {
    const wrapper = mount(TaskModal)
    await findButton(wrapper, '创建').trigger('click')
    expect(wrapper.text()).toContain('标题不能为空')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('输入标题后错误提示消失', async () => {
    const wrapper = mount(TaskModal)
    await findButton(wrapper, '创建').trigger('click')
    expect(wrapper.text()).toContain('标题不能为空')
    await wrapper.find('input').setValue('有效标题')
    expect(wrapper.text()).not.toContain('标题不能为空')
  })

  it('有效提交触发 submit 事件并携带完整任务对象', async () => {
    const wrapper = mount(TaskModal)
    await wrapper.find('input').setValue('  新标题  ')
    await wrapper.find('textarea').setValue('新描述')
    await wrapper.find('select').setValue('high')
    await findButton(wrapper, '创建').trigger('click')
    const payload = wrapper.emitted('submit')[0][0]
    expect(payload.title).toBe('新标题')
    expect(payload.description).toBe('新描述')
    expect(payload.priority).toBe('high')
    expect(payload.status).toBe('todo')
    expect(payload.id).toBeTruthy()
    expect(payload.createdAt).toBeTruthy()
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('按 ESC 触发 close 事件', async () => {
    const wrapper = mount(TaskModal)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('点击遮罩层触发 close 事件', async () => {
    const wrapper = mount(TaskModal)
    await wrapper.find('.fixed.inset-0').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('编辑模式预填任务数据并发出保留原 id/status/createdAt 的 submit', async () => {
    const task = {
      id: '42',
      title: '原标题',
      description: '原描述',
      status: 'in-progress',
      priority: 'low',
      dueDate: '2026-11-01',
      createdAt: '2026-09-01T00:00:00.000Z',
    }
    const wrapper = mount(TaskModal, { props: { task } })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('h2').text()).toBe('编辑任务')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('原标题')
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('原描述')
    expect((wrapper.find('select').element as HTMLSelectElement).value).toBe('low')
    await wrapper.find('input').setValue('新标题')
    await findButton(wrapper, '保存').trigger('click')
    const payload = wrapper.emitted('submit')[0][0]
    expect(payload).toEqual({
      id: '42',
      title: '新标题',
      description: '原描述',
      priority: 'low',
      status: 'in-progress',
      dueDate: '2026-11-01',
      createdAt: '2026-09-01T00:00:00.000Z',
    })
  })
})
