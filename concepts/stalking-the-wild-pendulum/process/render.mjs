// Pure-Node CDP screenshotter. Usage: node __render.mjs SRC IDX REACH OUT [WAITMS]
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync, statSync } from 'node:fs';

const [SRC, IDX, REACH, OUT, WAITMS='6500'] = process.argv.slice(2);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 8783, DBG = 9333;
const SCRATCH = '__render_scratch.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// 1) build scratch html
let html = readFileSync(SRC, 'utf8');
html = html.replace('loadConcept(0);', `loadConcept(${IDX});`).replaceAll('auto:true', 'auto:false');
if (REACH) html = html.replace('applyReach(0);', `applyReach(${REACH});`);
writeFileSync(SCRATCH, html);

// 2) start static server + chrome
const srv = spawn('python3', ['-m', 'http.server', String(PORT)], { stdio: 'ignore' });
const udd = spawnSync('mktemp', ['-d']).stdout.toString().trim();
const chrome = spawn(CHROME, [
  '--headless=new', '--use-gl=swiftshader', '--enable-unsafe-swiftshader',
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--disable-component-update', '--hide-scrollbars',
  `--remote-debugging-port=${DBG}`, `--user-data-dir=${udd}`, '--window-size=1400,900',
], { stdio: 'ignore' });

const cleanup = () => { try{chrome.kill('SIGKILL')}catch{}; try{srv.kill()}catch{}; try{unlinkSync(SCRATCH)}catch{} };
process.on('exit', cleanup);

let ws, nextId = 1; const pending = new Map();
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const id = nextId++; pending.set(id, { res, rej });
  ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
});

try {
  // 3) wait for devtools endpoint
  let wsUrl;
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(`http://localhost:${DBG}/json/version`); wsUrl = (await r.json()).webSocketDebuggerUrl; if (wsUrl) break; } catch {}
    await sleep(500);
  }
  if (!wsUrl) throw new Error('devtools endpoint never came up');

  ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = e => rej(new Error('ws error')); });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); }
  };

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);
  await send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  await send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__errs="";window.addEventListener("error",e=>{window.__errs+=(e.message||e.error)+" | "});' }, sessionId);
  await send('Page.navigate', { url: `http://localhost:${PORT}/${SCRATCH}` }, sessionId);
  await sleep(Number(WAITMS)); // let the CDN load + WebGL render a few frames

  // surface any page errors
  const errs = await send('Runtime.evaluate', { expression: 'window.__errs||""', returnByValue: true }, sessionId).catch(()=>({result:{value:''}}));
  const { data } = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  writeFileSync(OUT, Buffer.from(data, 'base64'));
  console.log(`RENDER OK ${statSync(OUT).size} bytes`);
  if (errs.result && errs.result.value) console.log('PAGE ERRORS:', errs.result.value);
  await send('Browser.close').catch(()=>{});
} catch (e) {
  console.log('RENDER FAILED:', e.message);
} finally {
  cleanup();
  process.exit(0);
}
