import fs from 'node:fs';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const runtime = process.env.CODEX_NODE_MODULES;
if (!runtime) throw new Error('Set CODEX_NODE_MODULES to the bundled runtime node_modules path');
const require = createRequire(`${runtime}/package.json`);
const { chromium } = require('playwright');
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4174', '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
await new Promise((resolve, reject) => {
  server.stdout.on('data', b => { if (b.toString().includes('4174')) resolve(); });
  server.on('error', reject);
  server.on('exit', code => reject(new Error(`Preview exited: ${code}`)));
});
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, colorScheme: 'light' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:4174/kb/incidents/4471-review/', { waitUntil: 'networkidle' });
  const text = await page.locator('body').innerText();
  for (const value of ['412 reports merged', '379', '33', '5 reports read as a one-day move', 'desk ref DR-']) {
    if (!text.includes(value)) throw new Error(`Rendered page is missing ${value}`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  const ref = text.match(/DR-[0-9A-Z]{4}-[0-9A-Z]{4}/)?.[0];
  fs.writeFileSync('evidence/rendered-page.txt', text + '\n');
  await page.screenshot({ path: 'evidence/rendered-page.png', fullPage: true });
  const table = await page.locator('table').first().innerText();
  const cases = await page.locator('table').nth(1).innerText();
  console.log(JSON.stringify({ title: await page.title(), deskRef: ref, table, cases, browserErrors: errors }, null, 2));
} finally {
  await browser.close();
  server.kill();
}
