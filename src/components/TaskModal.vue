<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['close', 'submit'])

const title = ref('')
const description = ref('')
const priority = ref('medium')
const error = ref('')

watch(title, () => { error.value = '' })

function handleSubmit() {
  if (!title.value.trim()) {
    error.value = '标题不能为空'
    return
  }
  emit('submit', {
    id: Date.now().toString(),
    title: title.value.trim(),
    description: description.value.trim(),
    priority: priority.value,
    status: 'todo',
    dueDate: '',
    createdAt: new Date().toISOString(),
  })
  title.value = ''
  description.value = ''
  priority.value = 'medium'
}

function handleEscape(e) {
  if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')" @keydown.escape="handleEscape">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6" role="dialog" aria-modal="true">
      <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">新建任务</h2>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标题 <span class="text-red-500">*</span></label>
        <input v-model="title" type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="输入任务标题" />
        <p v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</p>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">描述</label>
        <textarea v-model="description" rows="3" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="选填"></textarea>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">优先级</label>
        <select v-model="priority" class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>
      </div>

      <div class="flex justify-end gap-3">
        <button @click="$emit('close')" class="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">取消</button>
        <button @click="handleSubmit" class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">创建</button>
      </div>
    </div>
  </div>
</template>
