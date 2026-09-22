# Vibe Coding Runoob — 任务管理应用

基于 Vibe Coding 方法论构建的完整任务管理 Web 应用。

## 技术栈

| 用途 | 技术 |
|------|------|
| 前端框架 | Vue 3 |
| 构建工具 | Vite |
| 样式方案 | Tailwind CSS |
| 数据存储 | localStorage |

## 项目结构

```
vibe-coding-runoob/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── css/
│   └── input.css
├── src/
│   ├── main.js
│   ├── style.css
│   ├── App.vue
│   ├── types/
│   │   └── task.ts
│   ├── components/
│   │   ├── TaskCard.vue
│   │   ├── TaskList.vue
│   │   ├── TaskModal.vue
│   │   ├── KanbanBoard.vue
│   │   └── ThemeToggle.vue
│   ├── stores/
│   │   └── taskStore.ts
│   └── utils/
│       └── storage.ts
└── public/
```

## 快速开始

```bash
npm install
npm run dev
```

## 功能列表

- 创建、编辑、删除任务
- 任务状态：待办 / 进行中 / 完成
- 优先级：高（红）、中（黄）、低（绿）
- 看板视图（拖拽切换状态）
- 深色模式切换
- 数据自动持久化到 localStorage
- 响应式布局（支持移动端）

## 参考

本项目参考 [RUNOOB Vibe Coding 实践指南](https://www.runoob.com/vibe-coding/vibe-coding-practice.html) 构建。
