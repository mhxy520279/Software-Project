import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

if (!window.matchMedia) {
  window.matchMedia = (() => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  })) as unknown as typeof window.matchMedia
}

async function mountApp() {
  vi.resetModules()
  localStorage.clear()
  // App 及其依赖图（TaskCard / TaskModal / taskStore）必须在同一次
  // resetModules 之后动态加载，保证测试里的组件定义和 store 实例
  // 与 App 组件树使用的是同一份模块缓存。
  const App = (await import('./App.vue')).default
  const TaskCard = (await import('./components/TaskCard.vue')).default
  const TaskModal = (await import('./components/TaskModal.vue')).default
  const store = (await import('./stores/taskStore')).taskStore
  const wrapper = mount(App, { global: { stubs: { teleport: true } } })
  return { wrapper, TaskCard, TaskModal, store }
}

function modalButton(wrapper: any, text: string) {
  return wrapper.findAll('button').find((b: any) => b.text() === text)
}

describe('App 增改流程', () => {
  it('编辑任务：打开模态框预填数据，保存后更新存储并关闭弹窗', async () => {
    const { wrapper, TaskCard, TaskModal, store } = await mountApp()
    const seed = store.tasks.find((t: { id: string }) => t.id === '1')
    expect(seed).toBeTruthy()

    const card = wrapper.findAllComponents(TaskCard).find((c: any) => (c.props('task') as { id: string }).id === '1')
    expect(card).toBeTruthy()
    await card.find('button[title="编辑任务"]').trigger('click')

    const modal = wrapper.findComponent(TaskModal)
    expect(modal.exists()).toBe(true)
    await modal.vm.$nextTick()
    const input = modal.find('input')
    expect((input.element as HTMLInputElement).value).toBe(seed.title)

    await input.setValue('改过的标题')
    const saveBtn = modalButton(modal, '保存')
    expect(saveBtn).toBeTruthy()
    await saveBtn.trigger('click')

    expect(store.tasks.find((t: { id: string }) => t.id === '1').title).toBe('改过的标题')
    expect(wrapper.findComponent(TaskModal).exists()).toBe(false)
  })

  it('新建任务：提交后加入列表顶部并关闭弹窗', async () => {
    const { wrapper, TaskModal, store } = await mountApp()
    const storeBefore = store.tasks.length

    const addBtn = wrapper.findAll('button').find((b: any) => b.text().includes('新建任务'))
    expect(addBtn).toBeTruthy()
    await addBtn.trigger('click')

    const modal = wrapper.findComponent(TaskModal)
    expect(modal.exists()).toBe(true)
    await modal.find('input').setValue('全新任务')
    const createBtn = modalButton(modal, '创建')
    expect(createBtn).toBeTruthy()
    await createBtn.trigger('click')

    expect(store.tasks).toHaveLength(storeBefore + 1)
    expect(store.tasks[0].title).toBe('全新任务')
    expect(wrapper.findComponent(TaskModal).exists()).toBe(false)
  })
})