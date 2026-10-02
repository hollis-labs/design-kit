// Review evidence only; deliberately not a CI count/source-agreement gate.
import { mkdirSync, writeFileSync } from 'node:fs'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const output = process.env.RADIUS_OUTPUT
if (!output) throw new Error('Set RADIUS_OUTPUT to an evidence directory')
mkdirSync(output, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROME })
const results = []
try {
  for (const width of [1440, 390]) for (const [theme, mode] of [['sysop-p4-white', 'dark'], ['dir-b', 'light']]) {
    for (const surface of (process.env.RADIUS_SURFACES?.split(',') || ['matrix', 'matrixDashboard', 'gallery', 'accountAccess', 'chatHistory'])) {
      const page = await browser.newPage({ viewport: { width, height: 1100 }, reducedMotion: 'reduce' })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto(`${process.env.RADIUS_URL || 'http://127.0.0.1:5204'}/?surface=${surface}&theme=${theme}&mode=${mode}`)
      await page.waitForSelector('button')
      await page.waitForTimeout(800)
      if (surface === 'chatHistory') await page.getByRole('button', { name: 'Load older messages' }).scrollIntoViewIfNeeded()
      await page.addStyleTag({ content: '* { transition: none !important; animation: none !important; }' })
      const rows = await page.evaluate(() => [...document.querySelectorAll('button,input,[data-slot=card]')].map((el, index) => {
        const s = getComputedStyle(el)
        return { index, label: el.getAttribute('aria-label') || el.textContent.trim().replace(/\s+/g, ' ').slice(0, 90) || el.getAttribute('placeholder') || el.getAttribute('data-slot'), classes: el.className, radii: [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius], visible: el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0 }
      }))
      // Fixed crop shared by BEFORE and AFTER; gallery buttons are its first row.
      await page.screenshot({ path: `${output}/${surface}-${width}-${theme}-${mode}.png`, fullPage: false })
      results.push({ surface, width, theme, mode, rows, errors })
      await page.close()
    }
  }
} finally { await browser.close() }
writeFileSync(`${output}/computed.json`, JSON.stringify(results, null, 2) + '\n')
if (results.some(result => result.errors.length)) throw new Error('Browser errors: inspect computed.json')
console.log(`Captured ${results.length} states with zero browser errors`)
