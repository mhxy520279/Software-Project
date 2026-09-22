// 诊断：连接 CDP 目标，dump 页面状态与错误
import { mkdirSync } from 'node:fs'

const debugPort = process.argv[2] || '9222'
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

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function main() {
  const res = await fetch(`http://127.0.0.1:${debugPort}/json`)
  const targets = await res.json()
  console.log('targets:', targets.map(t => `${t.type} ${t.url}`).join('\n  '))
  const page = targets.find(t => t.type === 'page')
  ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject })
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
    }
  }
  await send('Runtime.enable')
  await send('Page.enable')
  await send('Runtime.evaluate', { expression: `console.error('probe')` })
  const logs = []
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.method === 'Runtime.consoleAPICalled' || msg.method === 'Runtime.exceptionThrown') {
      logs.push(JSON.stringify(msg.params).slice(0, 400))
    }
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
    }
  }
  await send('Page.navigate', { url: 'http://localhost:5173' })
  await sleep(3000)
  const state = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      url: location.href,
      ready: document.readyState,
      bodyText: document.body ? document.body.innerText.slice(0, 500) : null,
      h3: document.querySelectorAll('h3').length,
      buttons: [...document.querySelectorAll('button')].map(b => b.textContent.trim()),
      ls: JSON.stringify(localStorage)
    })`,
    returnByValue: true,
  })
  console.log('STATE_FULL:', JSON.stringify(state).slice(0, 2000))
  console.log('LOGS:', logs.length ? logs.join('\n') : '(none)')
  ws.close()
}
main().catch(e => { console.error('FAILED:', e.message); process.exit(1) })
