/**
 * Real-browser check of the microphone paths jsdom cannot cover: the MediaRecorder
 * fallback, MicSelector's real Popover, the permission re-prompt loop and the
 * insecure-context behaviour. Manual evidence, not run by CI.
 *
 *   npm run demo:build -w @hollis-labs/kit-voice
 *   PW_DIR=<dir containing node_modules/playwright-core> \
 *   CHROMIUM=<path to a Chromium/Chrome binary> \
 *   node packages/kit-voice/docs/evidence/verify-browser.mjs
 *
 * Chromium runs with --use-fake-device-for-media-stream (three fake microphones) and
 * --use-fake-ui-for-media-stream (the permission prompt is auto-accepted). The demo
 * is served from an in-process server bound to 127.0.0.1 only. The insecure-context
 * case reaches the same server as http://insecure.test:<port> through a host-resolver
 * rule, because browsers treat localhost and 127.0.0.1 as secure.
 *
 * NOT covered, and it cannot be here: Web Speech *recognition*. Headless Chromium has
 * a SpeechRecognition object but no speech service behind it, so what is recorded for
 * that path is only what the component did when asked, not that words were recognised.
 */
import { createRequire } from 'node:module'
import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const dist = path.resolve(here, '../../demo/dist')
const { chromium } = createRequire(path.join(process.env.PW_DIR ?? process.cwd(), '/'))('playwright-core')

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.map': 'application/json' }
const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://x')
  const file = path.join(dist, url.pathname === '/' ? 'index.html' : url.pathname)
  if (!file.startsWith(dist)) return void response.writeHead(403).end()
  if (url.pathname === '/favicon.ico') return void response.writeHead(204).end() // the demo has none
  try {
    const body = await readFile(file)
    response.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' })
    response.end(body)
  } catch {
    response.writeHead(404).end()
  }
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const port = server.address().port

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM,
  headless: true,
  args: [
    '--no-sandbox',
    '--use-fake-device-for-media-stream',
    '--use-fake-ui-for-media-stream',
    '--host-resolver-rules=MAP insecure.test 127.0.0.1',
  ],
})

const results = { browser: browser.version(), checks: [], observed: {}, pageErrors: [] }
const check = (name, pass, detail) => {
  results.checks.push({ name, pass: Boolean(pass), ...(detail === undefined ? {} : { detail }) })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail === undefined ? '' : `  ${JSON.stringify(detail)}`}`)
}

/** Init scripts. Each runs before the page's own scripts. */
const withoutWebSpeech = `delete window.SpeechRecognition; delete window.webkitSpeechRecognition;`
const countGetUserMedia = `
  window.__gum = { calls: 0, streams: [] };
  if (navigator.mediaDevices) {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      window.__gum.calls += 1;
      const stream = await original(constraints);
      window.__gum.streams.push(stream);
      return stream;
    };
  }`
const denyGetUserMedia = `
  window.__gum = { calls: 0, streams: [] };
  navigator.mediaDevices.getUserMedia = async () => {
    window.__gum.calls += 1;
    throw new DOMException('Permission denied', 'NotAllowedError');
  };`

async function open(scenario, { init = [], origin = `http://127.0.0.1:${port}`, query = '', viewport } = {}) {
  const context = await browser.newContext({ viewport: viewport ?? { width: 900, height: 900 } })
  const page = await context.newPage()
  page.on('pageerror', (error) => results.pageErrors.push({ scenario, error: String(error) }))
  page.on('console', (message) => {
    if (message.type() === 'error') results.pageErrors.push({ scenario, console: message.text() })
  })
  for (const script of init) await page.addInitScript(script)
  await page.goto(`${origin}/${query}`)
  await page.waitForSelector('[data-testid="mic-trigger"]')
  return { page, context }
}

const speech = (page) => page.locator('section[aria-labelledby="speech-input"] button')
const recorder = (page) => page.locator('[data-testid="recorder-input"]')
const trigger = (page) => page.locator('[data-testid="mic-trigger"]')
const popup = (page) => page.locator('[data-slot="popover-content"]')
const items = (page) => page.locator('[data-slot="command-item"]')
const gum = (page) => page.evaluate(() => window.__gum?.calls ?? null)

// ---- A. Web Speech present (Chromium has it, with no service behind it)
{
  const { page, context } = await open('web-speech', { init: [countGetUserMedia] })
  const env = await page.evaluate(async () => ({
    isSecureContext: window.isSecureContext,
    hasSpeechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
    hasMediaRecorder: 'MediaRecorder' in window,
    recorderTypeWebm: MediaRecorder.isTypeSupported('audio/webm'),
  }))
  results.observed.environment = env
  check('secure context on the served origin', env.isSecureContext)
  check('Web Speech mode is chosen where the browser has it', (await speech(page).getAttribute('data-availability')) === 'speech-recognition')
  check('the Web Speech button is enabled', await speech(page).isEnabled())
  await speech(page).click()
  await page.waitForTimeout(1500)
  results.observed.webSpeechAfterClick = {
    ariaPressed: await speech(page).getAttribute('aria-pressed'),
    errorLog: (await page.locator('[data-testid="errors"]').innerText()).split('\n'),
    note: 'recognition cannot run here (no speech service); this is what the component reported, not a pass or fail of recognition',
  }
  await context.close()
}

// ---- B. MediaRecorder fallback, real recording
{
  const { page, context } = await open('fallback', { init: [withoutWebSpeech, countGetUserMedia] })
  check('fallback mode when Web Speech is absent', (await recorder(page).getAttribute('data-availability')) === 'media-recorder')
  check(
    'fallback button without onAudioRecorded is disabled and says why',
    (await speech(page).isDisabled()) &&
      (await speech(page).getAttribute('data-unavailable')) === 'media-recorder-needs-onAudioRecorded'
  )
  check('fallback button with onAudioRecorded is enabled', await recorder(page).isEnabled())

  await recorder(page).click()
  await page.waitForFunction(() => document.querySelector('[data-testid="recorder-input"]')?.getAttribute('aria-pressed') === 'true')
  check('listening state shows after the microphone opens', true)
  await page.waitForTimeout(1200)
  await recorder(page).click()
  await page.waitForFunction(() => /^Received \d+ bytes/.test(document.querySelector('[data-testid="recorded"]')?.textContent ?? ''))
  const received = await page.locator('[data-testid="recorded"]').innerText()
  const bytes = Number(/Received (\d+) bytes/.exec(received)?.[1])
  results.observed.recording = { received }
  check('onAudioRecorded received a non-empty Blob typed by the recorder', bytes > 0 && /of audio\//.test(received), received)
  check('getUserMedia was called once for one recording', (await gum(page)) === 1, await gum(page))
  const live = await page.evaluate(() => window.__gum.streams.flatMap((s) => s.getTracks()).filter((t) => t.readyState === 'live').length)
  check('no microphone track is left live after stopping', live === 0, live)
  check('the button recovers', (await recorder(page).isEnabled()) && (await recorder(page).getAttribute('aria-pressed')) === 'false')
  await context.close()
}

// ---- C. Denied microphone: one prompt per open, not a loop
{
  const { page, context } = await open('denied', { init: [withoutWebSpeech, denyGetUserMedia] })
  await trigger(page).click()
  await popup(page).waitFor()
  await page.waitForTimeout(1500)
  check('denied: MicSelector asked once while open (no re-prompt loop)', (await gum(page)) === 1, await gum(page))
  await page.keyboard.press('Escape')
  await popup(page).waitFor({ state: 'detached' })
  await trigger(page).click()
  await popup(page).waitFor()
  await page.waitForTimeout(800)
  check('denied: reopening is the retry (second ask)', (await gum(page)) === 2, await gum(page))
  await page.keyboard.press('Escape')

  const before = await gum(page)
  await recorder(page).click()
  await page.waitForFunction(() => /permission-denied/.test(document.querySelector('[data-testid="errors"]')?.textContent ?? ''))
  check('denied: SpeechInput reports permission-denied through onError, once', (await gum(page)) === before + 1)
  await context.close()
}

// ---- D. MicSelector with the real Popover
{
  const { page, context } = await open('popover', { init: [countGetUserMedia] })
  await trigger(page).click()
  await popup(page).waitFor()
  await page.waitForFunction(() => document.querySelectorAll('[data-slot="command-item"]').length > 0)
  const labels = await items(page).allInnerTexts()
  results.observed.devices = labels
  check('real popover opens and lists the fake microphones', labels.length >= 2, labels)
  const triggerBox = await trigger(page).boundingBox()
  const popupBox = await popup(page).boundingBox()
  check('popover width follows the trigger (--anchor-width)', Math.abs(triggerBox.width - popupBox.width) <= 2, { trigger: triggerBox.width, popup: popupBox.width })

  const query = labels.at(-1).trim().toLowerCase()
  await page.locator('[data-slot="command-input"]').fill(query)
  await page.waitForTimeout(200)
  const filtered = await items(page).count()
  check('search matches the device label (keywords)', filtered >= 1 && filtered < labels.length, { query, filtered, total: labels.length })
  await page.locator('[data-slot="command-input"]').fill('')

  const choice = items(page).nth(1)
  const chosen = (await choice.innerText()).trim()
  await choice.click()
  await popup(page).waitFor({ state: 'detached' })
  check('selecting closes the popover', true)
  const shown = (await trigger(page).innerText()).trim()
  check('the trigger shows the selected device', shown.includes(chosen.split('\n')[0].trim()), { chosen, shown })
  check('opening asked getUserMedia once', (await gum(page)) === 1, await gum(page))
  await context.close()
}

// ---- E. Insecure context: no crash, and it says so
{
  const { page, context } = await open('insecure', { origin: `http://insecure.test:${port}` })
  const env = await page.evaluate(() => ({ isSecureContext: window.isSecureContext, hasMediaDevices: Boolean(navigator.mediaDevices) }))
  results.observed.insecure = env
  check('the insecure origin is really insecure', env.isSecureContext === false && env.hasMediaDevices === false, env)
  check(
    'insecure: SpeechInput is disabled with data-unavailable="insecure-context"',
    (await speech(page).isDisabled()) && (await speech(page).getAttribute('data-unavailable')) === 'insecure-context'
  )
  await trigger(page).click()
  await popup(page).waitFor()
  await page.waitForTimeout(500)
  check('insecure: MicSelector opens and shows its empty state without throwing', (await page.locator('[data-slot="command-empty"]').count()) >= 1)
  await context.close()
}

// ---- F. Screenshots: recording state plus the open selector, light and dark, two themes
for (const theme of ['nanite-default', 'sysop-p4-white']) {
  for (const mode of ['dark', 'light']) {
    const { page, context } = await open(`shot-${theme}-${mode}`, {
      init: [withoutWebSpeech],
      query: `?theme=${theme}&mode=${mode}`,
      viewport: { width: 760, height: 760 },
    })
    await recorder(page).click()
    await page.waitForFunction(() => document.querySelector('[data-testid="recorder-input"]')?.getAttribute('aria-pressed') === 'true')
    await trigger(page).click()
    await popup(page).waitFor()
    await page.waitForFunction(() => document.querySelectorAll('[data-slot="command-item"]').length > 0)
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(here, `${theme}-${mode}.png`) })
    await context.close()
  }
}
check('no uncaught page errors or console errors in any scenario', results.pageErrors.length === 0, results.pageErrors)

await browser.close()
server.close()
await writeFile(path.join(here, 'browser.json'), `${JSON.stringify(results, null, 2)}\n`)
process.exit(results.checks.every((c) => c.pass) ? 0 : 1)
