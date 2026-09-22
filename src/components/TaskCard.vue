<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: Object,
})

const emit = defineEmits(['toggle', 'delete'])

const priorityColor = computed(() => {
  const map = { high: 'border-red-500', medium: 'border-yellow-500', low: 'border-green-500' }
  return map[props.task.priority] || 'border-gray-300'
})

const doneStyle = computed(() => props.task.status === 'done' ? 'line-through text-gray-400' : '')

const statusLabels = { todo: '待办', 'in-progress': '进行中', done: '已完成' }
</script>

<template>
  <div
    :class="['bg-white dark:bg-gray-800 border-l-4 rounded-r-lg shadow-sm p-4 hover:scale-[1.02] transition-transform', priorityColor]"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1 flex items-start gap-3">
        <input
          type="checkbox"
          class="mt-1 w-4 h-4 accent-indigo-600 cursor-pointer shrink-0"
          :checked="task.status === 'done'"
          :title="task.status === 'done' ? '标记为未完成' : '标记为完成'"
          @change="$emit('toggle', task.id)"
        />
        <div class="flex-1">
          <h3 :class="['font-semibold text-gray-900 dark:text-gray-100', doneStyle]">{{ task.title }}</h3>
          <p v-if="task.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ task.description }}</p>
          <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span :class="{
              'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200': task.priority === 'high',
              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200': task.priority === 'medium',
              'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200': task.priority === 'low',
            }">
              {{ { high: '高', medium: '中', low: '低' }[task.priority] }}
            </span>
            <span v-if="task.dueDate">{{ task.dueDate }}</span>
            <span>{{ statusLabels[task.status] || task.status }}</span>
          </div>
        </div>
      </div>
      <button
        @click.stop="$emit('delete', task.id)"
        class="text-gray-300 hover:text-red-500 transition-colors ml-2"
        title="删除任务"
      >
        ✕
      </button>
    </div>
  </div>
</template>
