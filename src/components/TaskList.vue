<script setup>
import { ref, computed } from 'vue'
import TaskCard from './TaskCard.vue'

const props = defineProps({
  tasks: Array,
})

const emit = defineEmits(['toggle', 'delete', 'edit'])

const filter = ref('all')

const filteredTasks = computed(() => {
  const list = props.tasks || []
  if (filter.value === 'all') return list
  return list.filter(t => t.status === filter.value)
})

const sortedTasks = computed(() =>
  [...filteredTasks.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
)

const statusLabels = { all: '全部', todo: '待办', 'in-progress': '进行中', done: '已完成' }
</script>

<template>
  <div>
    <div class="flex gap-2 mb-6 flex-wrap">
      <button
        v-for="s in ['all', 'todo', 'in-progress', 'done']"
        :key="s"
        @click="filter = s"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-colors',
          filter === s
            ? 'bg-indigo-600 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
      >
        {{ statusLabels[s] }}
      </button>
    </div>

    <div v-if="sortedTasks.length === 0" class="text-center py-12 text-gray-400 dark:text-gray-500">
      还没有任务，点击上方按钮创建第一个吧
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <TaskCard
        v-for="task in sortedTasks"
        :key="task.id"
        :task="task"
        @toggle="emit('toggle', $event)"
        @delete="emit('delete', $event)"
        @edit="emit('edit', $event)"
      />
    </div>
  </div>
</template>
