/**
 * Real-browser check of what jsdom cannot cover: the microphone paths (the MediaRecorder
 * fallback, MicSelector's real Popover, the permission re-prompt loop, the insecure
 * context), VoiceSelector's dialog and Transcription's seeking in a real layout, and the
 * AudioPlayer: media-chrome's elements upgraded, a Blob playing, play/pause, seek buttons,
 * the time and volume ranges, mute, and Transcription following and seeking the audio.
 * Manual evidence, not run by CI.
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

// ---- G. VoiceSelector in a real Dialog
{
  const { page, context } = await open('voice-selector')
  const voiceTrigger = page.locator('[data-testid="voice-trigger"]')
  const dialog = page.getByRole('dialog', { name: 'Choose a voice' })
  await voiceTrigger.click()
  await dialog.waitFor()
  check('voice dialog opens, named by its title', true)
  check('three voices listed', (await items(page).count()) === 3, await items(page).allInnerTexts())
  check(
    'gender and accent are announced by name (role=img + aria-label)',
    (await dialog.locator('[role="img"][aria-label="female"]').count()) === 1 &&
      (await dialog.locator('[role="img"][aria-label="british"]').count()) === 1
  )

  await dialog.getByPlaceholder('Search voices...').fill('oli')
  await page.waitForTimeout(200)
  check('search narrows to the match (keywords)', (await items(page).count()) === 1 && /Oliver/.test(await items(page).first().innerText()))
  await dialog.getByPlaceholder('Search voices...').fill('')
  await page.waitForTimeout(200)

  await page.locator('[data-testid="preview-aria"]').click()
  check(
    'preview marks itself playing without selecting the row or closing the dialog',
    (await page.locator('[data-testid="preview-aria"]').getAttribute('aria-label')) === 'Pause preview' &&
      (await page.locator('[data-testid="voice-value"]').innerText()) === 'none' &&
      (await dialog.isVisible())
  )

  await page.keyboard.press('Escape')
  await dialog.waitFor({ state: 'detached' })
  check('Escape closes it and chooses nothing', (await page.locator('[data-testid="voice-value"]').innerText()) === 'none')

  await voiceTrigger.click()
  await dialog.waitFor()
  await items(page).filter({ hasText: 'Mei' }).click()
  await dialog.waitFor({ state: 'detached' })
  check(
    'choosing a voice closes the dialog and sets the value',
    (await page.locator('[data-testid="voice-value"]').innerText()) === 'mei' && (await voiceTrigger.innerText()).includes('Mei')
  )
  await context.close()
}

// ---- H. Transcription follows the host's clock and seeks on click
{
  const { page, context } = await open('transcription')
  const slider = 'section[aria-labelledby="transcription"]' // the audio section has a transcription of its own
  const active = () => page.locator(`${slider} [data-slot="transcription-segment"][data-active="true"]`).allInnerTexts()
  check('at 1.0s the active segment is "input"', JSON.stringify(await active()) === '["input"]', await active())
  await page.locator('[data-testid="time"]').fill('2')
  check('the active segment follows the controlled time', JSON.stringify(await active()) === '["arrives"]', await active())
  await page.locator(`${slider} [data-slot="transcription-segment"]`, { hasText: 'text' }).click()
  check(
    'clicking a segment seeks the host clock to its start',
    (await page.locator('[data-testid="time-value"]').innerText()) === '3.0s' && JSON.stringify(await active()) === '["text"]',
    await page.locator('[data-testid="time-value"]').innerText()
  )
  await context.close()
}

// ---- I. AudioPlayer: real media-chrome elements playing a local Blob
{
  const { page, context } = await open('audio-player')
  const audio = (property) => page.evaluate((name) => document.querySelector('[data-slot="audio-player-element"]')[name], property)
  // Moves like a hand does (media-chrome's ranges read the pointer's travel), then presses.
  const clickAt = async (selector, fraction) => {
    await page.locator(selector).scrollIntoViewIfNeeded()
    // The range's hit area is its inner container, narrower than the element (padding, gaps).
    const box = await page.locator(selector).evaluate((element) => {
      const rect = (element.shadowRoot?.querySelector('#container') ?? element).getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    })
    const x = box.x + box.width * fraction
    const y = box.y + box.height / 2
    await page.mouse.move(x - 6, y)
    await page.mouse.move(x, y, { steps: 6 })
    await page.mouse.down()
    await page.waitForTimeout(50)
    await page.mouse.up()
  }
  const pairedActive = () =>
    page.locator('[data-testid="paired-transcription"] [data-slot="transcription-segment"][data-active="true"]').allInnerTexts()

  const upgraded = await page.evaluate(() => ({
    controller: Boolean(customElements.get('media-controller')),
    play: Boolean(customElements.get('media-play-button')),
    audioFlag: document.querySelector('[data-slot="audio-player"]').hasAttribute('audio'),
  }))
  check('media-chrome elements are registered and the controller is in audio mode', upgraded.controller && upgraded.play && upgraded.audioFlag, upgraded)

  await page.waitForFunction(() => document.querySelector('[data-slot="audio-player-element"]').readyState >= 1)
  const src = await audio('src')
  const duration = await audio('duration')
  check('the Blob plays through an object URL, and its duration is read', String(src).startsWith('blob:') && Math.abs(duration - 4) < 0.1, { src: String(src).slice(0, 24), duration })
  check('no stray attribute reaches the <audio> node', await page.evaluate(() => {
    const el = document.querySelector('[data-slot="audio-player-element"]')
    return !el.hasAttribute('data') && !el.hasAttribute('blob')
  }))

  await page.locator('[data-slot="audio-player-play-button"]').click()
  await page.waitForFunction(() => document.querySelector('[data-slot="audio-player-element"]').currentTime > 0.5, null, { timeout: 5000 })
  check('play starts playback and the clock advances', (await audio('paused')) === false, await audio('currentTime'))
  await page
    .waitForFunction(() => {
      const active = document.querySelector('[data-testid="paired-transcription"] [data-active="true"]')
      return active && active.textContent !== 'A'
    }, null, { timeout: 3000 })
    .catch(() => {})
  check('the paired transcription follows the audio', JSON.stringify(await pairedActive()) !== '["A"]', await pairedActive())

  await page.locator('[data-slot="audio-player-play-button"]').click()
  await page.waitForTimeout(200)
  check('pause pauses it', (await audio('paused')) === true)

  await page.evaluate(() => { document.querySelector('[data-slot="audio-player-element"]').currentTime = 1 })
  await page.waitForTimeout(200)
  await page.locator('[data-slot="audio-player-seek-forward-button"]').click()
  await page.waitForTimeout(300)
  const afterForward = await audio('currentTime')
  check('seek forward moves the clock by its offset (1s)', Math.abs(afterForward - 2) < 0.3, afterForward)
  await page.locator('[data-slot="audio-player-seek-backward-button"]').click()
  await page.waitForTimeout(300)
  const afterBackward = await audio('currentTime')
  check('seek backward moves it back by its offset (1s)', Math.abs(afterBackward - 1) < 0.3, afterBackward)

  const rangeBox = await page.locator('[data-slot="audio-player-time-range"]').boundingBox()
  const hitArea = await page.locator('[data-slot="audio-player-time-range"]').evaluate((element) => {
    const rect = element.shadowRoot.querySelector('#container').getBoundingClientRect()
    return { width: Math.round(rect.width), height: Math.round(rect.height) }
  })
  check('the time range has a usable hit area (a unitless --media-control-padding collapsed its height; it was ~50px wide)', hitArea.height >= 16 && hitArea.width >= 100, { host: rangeBox, hitArea })
  await page.locator('[data-slot="audio-player-time-range"]').scrollIntoViewIfNeeded()
  await clickAt('[data-slot="audio-player-time-range"]', 0.75)
  await page.waitForTimeout(400)
  const afterRange = await audio('currentTime')
  check('clicking the time range seeks proportionally (~75% of 4s)', afterRange > 2.4 && afterRange < 3.6, afterRange)

  await clickAt('[data-slot="audio-player-volume-range"]', 0.5)
  await page.waitForTimeout(300)
  const volume = await audio('volume')
  check('clicking the volume range sets the volume (~0.5)', volume > 0.25 && volume < 0.75, volume)

  await page.locator('[data-slot="audio-player-mute-button"]').click()
  await page.waitForTimeout(200)
  const muted = await audio('muted')
  await page.locator('[data-slot="audio-player-mute-button"]').click()
  await page.waitForTimeout(200)
  check('the mute button toggles muted', muted === true && (await audio('muted')) === false)

  await page.locator('[data-testid="paired-transcription"] [data-slot="transcription-segment"]', { hasText: 'generated' }).click()
  await page.waitForTimeout(500)
  check(
    'clicking a transcription word seeks the audio to it, and it becomes active',
    Math.abs((await audio('currentTime')) - 2) < 0.3 && JSON.stringify(await pairedActive()) === '["generated"]',
    { currentTime: await audio('currentTime'), active: await pairedActive() }
  )
  await context.close()
}

// ---- F. Screenshots, light and dark, two themes: recording + open MicSelector; voice dialog; transcription
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
    await page.keyboard.press('Escape')
    await popup(page).waitFor({ state: 'detached' })

    // The voice dialog, one row previewing, and the transcription mid-playback.
    await page.locator('[data-testid="time"]').fill('2')
    await page.locator('[data-testid="voice-trigger"]').click()
    await page.getByRole('dialog', { name: 'Choose a voice' }).waitFor()
    await page.locator('[data-testid="preview-aria"]').click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(here, `voice-${theme}-${mode}.png`) })
    await page.keyboard.press('Escape')
    await page.getByRole('dialog').waitFor({ state: 'detached' })
    await page.locator('section[aria-labelledby="transcription"]').screenshot({ path: path.join(here, `transcription-${theme}-${mode}.png`) })

    // The player paused part-way, with the paired transcription under it.
    await page.evaluate(() => { document.querySelector('[data-slot="audio-player-element"]').currentTime = 1.5 })
    await page.waitForTimeout(400)
    await page.locator('section[aria-labelledby="audio-player"]').screenshot({ path: path.join(here, `audio-${theme}-${mode}.png`) })
    await context.close()
  }
}
check('no uncaught page errors or console errors in any scenario', results.pageErrors.length === 0, results.pageErrors)

await browser.close()
server.close()
await writeFile(path.join(here, 'browser.json'), `${JSON.stringify(results, null, 2)}\n`)
process.exit(results.checks.every((c) => c.pass) ? 0 : 1)
