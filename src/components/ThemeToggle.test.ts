import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemeToggle from './ThemeToggle.vue'

const originalMatchMedia = window.matchMedia

function stubMatchMedia(matches: boolean) {
  window.matchMedia = (() => ({
    matches,
    media: '',
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false
    },
  })) as unknown as typeof window.matchMedia
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  window.matchMedia = originalMatchMedia || (() => ({ matches: false })) as unknown as typeof window.matchMedia
})

describe('ThemeToggle', () => {
  it('点击切换深色模式并记住选择到 localStorage', async () => {
    const wrapper = mount(ThemeToggle)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(wrapper.text()).toContain('☀️')

    await wrapper.find('button').trigger('click')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('vibe-coding-runoob-theme')).toBe('dark')
    expect(wrapper.text()).toContain('🌙')

    await wrapper.find('button').trigger('click')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('vibe-coding-runoob-theme')).toBe('light')
  })

  it('挂载时恢复已保存的深色选择', () => {
    localStorage.setItem('vibe-coding-runoob-theme', 'dark')
    mount(ThemeToggle)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('无保存值时跟随系统深色偏好', () => {
    stubMatchMedia(true)
    mount(ThemeToggle)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
