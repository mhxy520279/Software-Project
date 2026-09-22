<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)

function toggle() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('vibe-coding-runoob-theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const saved = localStorage.getItem('vibe-coding-runoob-theme')
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>

<template>
  <button
    @click="toggle"
    class="w-10 h-10 rounded-full bg-indigo-500 dark:bg-yellow-400 flex items-center justify-center text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
    :title="isDark ? '切换到亮色模式' : '切换到深色模式'"
  >
    <span v-if="!isDark">☀️</span>
    <span v-else>🌙</span>
  </button>
</template>
