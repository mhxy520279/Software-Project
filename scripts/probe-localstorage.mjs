// 探针：确认 CDP 目标 origin / localStorage 可用性
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

async function evalInPage(expression) {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true })
  if (res.exceptionDetails) {
    return 'EXC: ' + (res.exceptionDetails.exception?.description || res.exceptionDetails.text)
  }
  return res.result?.value
}

async function main() {
  const res = await fetch(`http://127.0.0.1:${debugPort}/json`)
  const targets = await res.json()
  console.log('targets:')
  for (const t of targets) console.log(`  ${t.type} ${t.url}  [${t.id}]`)

  // 依次连接每个 page target 探测
  for (const page of targets.filter(t => t.type === 'page')) {
    console.log(`\n=== target ${page.id} (${page.url}) ===`)
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

    console.log('href     :', await evalInPage('location.href'))
    console.log('origin   :', await evalInPage('location.origin'))
    console.log('ready    :', await evalInPage('document.readyState'))
    console.log('title    :', await evalInPage('document.title'))
    console.log('lsCheck  :', await evalInPage(`(() => { try { localStorage.setItem('_probe','1'); return 'ok:' + localStorage.getItem('_probe') } catch (e) { return 'DENIED: ' + e.message } })()`))

    if (page.url.includes('about:blank')) {
      console.log('-- navigate about:blank -> 5173 --')
      await send('Page.navigate', { url: 'http://localhost:5173' })
      await sleep(4000)
      console.log('href2    :', await evalInPage('location.href'))
      console.log('title2   :', await evalInPage('document.title'))
      console.log('body2    :', (await evalInPage('document.body ? document.body.innerText.slice(0,120) : null')))
      console.log('lsCheck2 :', await evalInPage(`(() => { try { localStorage.setItem('_probe','1'); return 'ok:' + localStorage.getItem('_probe') } catch (e) { return 'DENIED: ' + e.message } })()`))
    }
    ws.close()
  }
  console.log('\nDONE')
}
main().catch(e => { console.error('FAILED:', e); process.exit(1) })