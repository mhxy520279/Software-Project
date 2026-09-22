# 多轮迭代提示词过程

本项目采用 runoob Vibe Coding 实践指南推荐的迭代节奏，每一轮只聚焦一个功能，并在浏览器中验证后提交。以下是每轮对话对应的提示词核心内容，以及最终整理后的实现与提交。

---

## 迭代节奏与提示词公式

> 公式：**目标 + 约束 + 上下文**
>
> 每次对话只做一个功能 → 每次修改立刻在浏览器里验证 → 每个功能完成立刻 `git commit` → 每天结束 `push` 到 GitHub。

---

## 第 1 轮：搭建项目骨架

**提示词**：

> 帮我用 Vue 3 + Vite + Tailwind CSS v3 搭一个任务管理应用的空壳，要求：
> - 项目命名为 `vibe-coding-runoob`；
> - 使用 `<script setup>` 风格的 `.vue` 文件；
> - 配置好 Tailwind CSS 与深色模式基础类；
> - 只保留首页占位，后面再实现任务列表。
> 验证方式：`npm run dev` 能正常启动，`npm run build` 能成功构建。

**关键提交**：

```text
a360d59 feat: project scaffold with Vue 3, Vite, Tailwind v3
```

---

## 第 2 轮：任务列表 + 表单

**提示词**：

> 在骨架上实现任务列表和新建/编辑弹窗：
> - 任务字段：标题（必填）、描述（选填）、优先级（高/中/低）、状态（待办/进行中/已完成）、创建时间；
> - 列表页：支持筛选全部/待办/进行中/已完成，按创建时间倒序；
> - 每个任务卡片显示标题、描述、优先级、状态，并提供删除和编辑按钮；
> - 使用一个共享的 `taskStore.ts` 管理状态，Vue 组件只负责展示；
> - 标题为空时弹窗提示“标题不能为空”。
> 验证方式：在浏览器中点击「+ 新建任务」、填写信息、保存后任务出现在列表顶部。

**关键提交**：

```text
a8eea06 feat: task list, create/edit modal and basic state management
```

---

## 第 3 轮：localStorage 持久化

**提示词**：

> 让任务数据刷新不丢失：
> - 将任务数组持久化到 `localStorage`，使用键名 `vibe-coding-runoob-tasks`；
> - 页面刷新后自动读取并恢复任务；
> - 第一次访问时提供 3 条默认任务；
> - 如果 `localStorage` 里的 JSON 损坏或非数组，不能白屏，要安全降级到默认值。

**后续补强（本轮完成）**：

> 加固 `loadTasks`：过滤非法任务元素，对合法元素补齐可选字段，确保非数组/脏 JSON/非法状态/非法优先级 都能安全处理。

**关键提交**：

```text
e2a88e0 feat: persist tasks to localStorage, restore on refresh
30229be fix: harden localStorage persistence against non-array/corrupt data
```

---

## 第 4 轮：看板视图 + 拖拽改状态

**提示词**：

> 加一个「看板」视图：
> - 三列：待办、进行中、已完成；
> - 每列显示该状态的任务卡片和计数；
> - 支持拖拽卡片到其它列，释放后自动修改任务状态；
> - 列表/看板通过顶部 tab 切换；
> - 移动端也能正常显示。
> 验证方式：在浏览器中切到看板，把卡片拖到「进行中」，状态应被更新。

**关键提交**：

```text
e2a88e0 feat: task editing with kanban/theme/app integration tests
```

---

## 第 5 轮：深色模式 + 移动端适配

**提示词**：

> 给应用加上深色模式：
> - 顶部放一个主题切换按钮，☀️/🌙 图标；
> - 切换时给 `<html>` 添加/移除 `dark` 类，并保存偏好到 `localStorage`；
> - 刷新后恢复用户选择，未选择时跟随系统 `prefers-color-scheme`；
> - 所有组件使用 `dark:` 前缀适配深色样式；
> - 列表和看板在移动端堆叠显示。
> 验证方式：点击主题按钮，页面切换为深色；刷新后仍保持深色。

**关键提交**：

```text
e2a88e0 feat: task editing with kanban/theme/app integration tests
```

---

## 第 6 轮：完成验收、演示截图与文档（本轮）

**提示词**：

> 帮我完成并检验整个项目：
> - 用真实浏览器演示核心功能并截图保存到 `screenshots/`；
> - 保存多轮迭代开发的提示词过程到 `docs/prompts.md`；
> - 完成 README.md，包含功能截图、技术栈、快速开始、测试/构建命令、迭代过程；
> - 跑全量测试和生产构建；
> - 提交并推送到 GitHub。
> 约束：使用项目已有的 Vue 3 + Vite + Tailwind v3 + Vitest 技术栈，不要引入额外运行时依赖。

---

## 验证与提交清单

- [x] 单元测试：`npx vitest run` —— 40/40 通过
- [x] 生产构建：`npm run build` —— 成功
- [x] 真实浏览器演示：Edge headless + CDP，7 张截图
- [x] README.md 与 docs/prompts.md 已完成
- [x] `git commit` + `git push origin main`
