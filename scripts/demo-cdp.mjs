// 真实浏览器演示脚本：驱动 Edge(CDP) 操作应用并逐步截图
// 用法: node scripts/demo-cdp.mjs <debugPort> <profileDir> <outDir>
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const [debugPort, profileDir, outDir] = process.argv.slice(2)
mkdirSync(outDir, { recursive: true })

const APP = 'http://localhost:5173'
let ws = null
let msgId = 0
const pending = new Map()

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

const sleepMs = 250

async function connect() {
  const res = await fetch(`http://127.0.0.1:${debugPort}/json`)
  const targets = await res.json()
  const page = (targets || []).find(t => t.type === 'page' && t.url.includes('5173'))
    || (targets || []).find(t => t.type === 'page')
    || (targets || [])[0]
  if (!page) throw new Error('no page target found')
  console.log('connected target:', page.url)
  ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      if (msg.error) reject(new Error(msg.error.message))
      else resolve(msg.result)
    }
  }
}

async function evaluate(expression) {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (res.exceptionDetails) throw new Error('evaluate: ' + (res.exceptionDetails.exception?.description || 'unknown'))
  return res.result?.value
}

async function waitFor(fnExpr, timeoutMs = 10000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await evaluate(fnExpr)) return
    await sleep(200)
  }
  throw new Error('waitFor timeout: ' + fnExpr)
}

async function clickText(text) {
  const ok = await evaluate(`(() => {
    const els = [...document.querySelectorAll('button')]
    const el = els.find(b => b.textContent.trim() === ${JSON.stringify(text)})
    if (!el) return false
    el.click()
    return true
  })()`)
  if (!ok) throw new Error('button not found: ' + text)
  await sleep(sleepMs)
}

async function screenshot(name) {
  const { data } = await send('Page.captureScreenshot', { format: 'png' })
  if (!data) throw new Error('capture failed: ' + name)
  const { writeFileSync } = await import('node:fs')
  writeFileSync(join(outDir, name + '.png'), Buffer.from(data, 'base64'))
  console.log('saved:', name + '.png')
}

async function setInput(selector, value) {
  const ok = await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)})
    if (!el) return false
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(el, ${JSON.stringify(value)})
    el.dispatchEvent(new Event('input', { bubbles: true }))
    return true
  })()`)
  if (!ok) throw new Error('input not found: ' + selector)
  await sleep(150)
}

async function setTextarea(selector, value) {
  const ok = await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)})
    if (!el) return false
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
    setter.call(el, ${JSON.stringify(value)})
    el.dispatchEvent(new Event('input', { bubbles: true }))
    return true
  })()`)
  if (!ok) throw new Error('textarea not found: ' + selector)
  await sleep(150)
}

async function main() {
  await connect()
  await send('Page.enable')
  await send('Runtime.enable')

  // 导航到应用并等待真实文档就绪（轮询，容忍导航期上下文失效）
  async function navigateAndWait() {
    await send('Page.navigate', { url: APP })
    const start = Date.now()
    while (Date.now() - start < 25000) {
      try {
        if (await evaluate(`location.href.includes('localhost:5173') && document.title === 'Vibe Coding Runoob' && document.readyState === 'complete' && document.body.innerText.includes('新建任务')`)) {
          return
        }
      } catch { /* 导航中上下文失效，重试 */ }
      await sleep(300)
    }
    throw new Error('navigateAndWait timeout')
  }
  await navigateAndWait()
  // 清空旧数据，保证演示可重复运行
  await evaluate(`localStorage.clear()`)
  await send('Page.reload', { ignoreCache: true })
  await navigateAndWait()
  await sleep(600)
  await screenshot('01-default-list')

  // —— 演示 1：新建任务（表单交互）——
  await evaluate('document.body.innerHTML.includes("列表") || true')
  await clickText('+ 新建任务')
  await sleep(300)
  // 先演示必填校验
  await clickText('创建')
  await sleep(200)
  const err = await evaluate(`document.body.innerText.includes('标题不能为空')`)
  console.log('title-validation:', err)
  await screenshot('02-modal-validation')
  await setInput('input[placeholder="输入任务标题"]', '完成项目验收与文档')
  await setTextarea('textarea[placeholder="选填"]', '多轮迭代已完成，最后演示并截图')
  await evaluate(`(() => { const s = document.querySelector('select'); s.value = 'high'; s.dispatchEvent(new Event('change', { bubbles: true })) })()`)
  await sleep(150)
  await clickText('创建')
  await waitFor(`document.body.innerText.includes('完成项目验收与文档')`)
  await sleep(400)
  await screenshot('03-after-create')

  // —— 演示 2：刷新不丢失（持久化）——
  const before = await evaluate(`localStorage.getItem('vibe-coding-runoob-tasks')`)
  console.log('localStorage before refresh:', before ? before.slice(0, 80) + '…' : '(empty)')
  await send('Page.reload', { ignoreCache: true })
  await waitFor(`document.body.innerText.includes('完成项目验收与文档')`)
  await sleep(500)
  await screenshot('04-after-refresh')

  // —— 演示 3：看板视图 + 拖拽 ——
  await clickText('看板')
  await waitFor(`['待办','进行中','已完成'].every(t => document.body.innerText.includes(t))`)
  await sleep(400)
  await screenshot('05-kanban')
  // 拖拽：把「完成项目验收与文档」卡片拖到「进行中」列
  const drag = await evaluate(`(() => {
    const card = [...document.querySelectorAll('h3')].find(h => h.textContent.includes('完成项目验收与文档'))
    if (!card) return 'card-not-found'
    const source = card.closest('[draggable]')
    const cols = [...document.querySelectorAll('h3')].filter(h => h.textContent.includes('进行中'))
    const targetCol = cols.find(h => h.textContent.trim().startsWith('进行中'))
    if (!source || !targetCol) return 'col-not-found'
    const target = targetCol.closest('div')
    const dt = new DataTransfer()
    source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }))
    target.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }))
    target.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }))
    return 'dropped'
  })()`)
  console.log('drag result:', drag)
  await sleep(400)
  await screenshot('06-kanban-after-drag')

  // —— 演示 4：深色模式 ——
  await clickText('看板') // 确保还在看板
  const themeBtn = await evaluate(`(() => {
    const el = document.querySelector('button[title*="深色"], button[title*="亮色"]')
    if (!el) return false
    el.click()
    return true
  })()`)
  console.log('theme toggle clicked:', themeBtn)
  await sleep(500)
  await screenshot('07-dark-mode')

  // 总结当前 DOM 状态
  const counts = await evaluate(`(() => ({
    tasks: document.querySelectorAll('h3').length,
    hasNoDataEmpty: document.body.innerText.includes('还没有任务'),
    theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    stored: !!localStorage.getItem('vibe-coding-runoob-tasks')
  }))()`)
  console.log('final state:', JSON.stringify(counts))

  ws.close()
  console.log('DONE')
}

main().catch((e) => {
  console.error('FAILED:', e.message)
  process.exit(1)
})
