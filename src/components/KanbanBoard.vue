<script setup>
import { computed } from 'vue'
import TaskCard from './TaskCard.vue'

const props = defineProps({
  tasks: Array,
})

const emit = defineEmits(['toggle', 'delete', 'move'])

const columns = [
  { key: 'todo', label: '待办' },
  { key: 'in-progress', label: '进行中' },
  { key: 'done', label: '已完成' },
]

const grouped = computed(() => {
  const map: Record<string, typeof props.tasks> = { todo: [], 'in-progress': [], done: [] }
  props.tasks.forEach(t => {
    if (map[t.status]) map[t.status].push(t)
  })
  return map
})

function onDrop(taskId: string, newStatus: string) {
  emit('move', taskId, newStatus)
}

function allowDrop(e: DragEvent) {
  e.preventDefault()
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div
      v-for="col in columns"
      :key="col.key"
      class="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 min-h-[300px]"
      @dragover.prevent="allowDrop"
      @drop="onDrop($event, col.key)"
    >
      <h3 class="text-sm font-bold text-gray-600 dark:text-gray-300 mb-4 uppercase tracking-wider">
        {{ col.label }}
        <span class="ml-2 text-xs bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full">
          {{ grouped[col.key].length }}
        </span>
      </h3>

      <div class="space-y-3 min-h-[100px]">
        <div
          v-for="task in grouped[col.key]"
          :key="task.id"
          draggable
          @dragstart="($event) => ($event.dataTransfer as DataTransfer).setData('taskId', task.id)"
          @dragend="($event) => ($event.target as HTMLElement).style.opacity = '1'"
          class="cursor-grab active:cursor-grabbing"
        >
          <TaskCard
            :task="task"
            @toggle="emit('toggle', $event)"
            @delete="emit('delete', $event)"
          />
        </div>

        <div v-if="grouped[col.key].length === 0" class="text-center py-8 text-gray-300 dark:text-gray-600 text-sm">
          拖拽任务到此处
        </div>
      </div>
    </div>
  </div>
</template>
