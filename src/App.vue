<script setup>
import { ref } from 'vue'
import { taskStore } from './stores/taskStore'
import TaskList from './components/TaskList.vue'
import KanbanBoard from './components/KanbanBoard.vue'
import TaskModal from './components/TaskModal.vue'
import ThemeToggle from './components/ThemeToggle.vue'

const showModal = ref(false)
const view = ref('list')

function handleAddTask(task) {
  taskStore.addTask(task)
  showModal.value = false
}

function handleMoveTask(id, status) {
  taskStore.updateTask(id, { status })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <nav class="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <h1 class="text-xl font-bold">Vibe Coding Runoob</h1>
      <div class="flex items-center gap-4">
        <button
          @click="showModal = true"
          class="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
        >
          + 新建任务
        </button>
        <ThemeToggle />
      </div>
    </nav>

    <main class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex gap-2 mb-6">
        <button
          @click="view = 'list'"
          :class="view === 'list' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
          class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          列表
        </button>
        <button
          @click="view = 'kanban'"
          :class="view === 'kanban' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
          class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          看板
        </button>
      </div>

      <TaskList v-if="view === 'list'" :tasks="taskStore.tasks" @toggle="taskStore.toggleTaskStatus" @delete="taskStore.deleteTask" />
      <KanbanBoard v-else :tasks="taskStore.tasks" @toggle="taskStore.toggleTaskStatus" @delete="taskStore.deleteTask" @move="handleMoveTask" />
    </main>

    <Teleport to="body">
      <TaskModal v-if="showModal" @close="showModal = false" @submit="handleAddTask" />
    </Teleport>
  </div>
</template>
