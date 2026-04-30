import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsDir = resolve(__dirname, '..', 'docs', 'screenshots');

if (!existsSync(docsDir)) {
  mkdirSync(docsDir, { recursive: true });
}

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });

  // Home - Skill Directory (default view)
  const homeCtx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const homePage = await homeCtx.newPage();
  await homePage.goto('http://127.0.0.1:9000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await homePage.waitForTimeout(5000);
  await homePage.screenshot({ path: resolve(docsDir, 'home.png'), fullPage: false });
  console.log('Home captured');
  await homeCtx.close();

  // Builder - clicks BUILD tab in nav then NEW button
  const forgeCtx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const forgePage = await forgeCtx.newPage();
  await forgePage.goto('http://127.0.0.1:9000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await forgePage.waitForTimeout(5000);
  // Click the MAKE button in the header area
  const makeBtn = await forgePage.locator('button:has-text("MAKE")').first();
  if (await makeBtn.isVisible()) await makeBtn.click();
  await forgePage.waitForTimeout(2000);
  await forgePage.screenshot({ path: resolve(docsDir, 'forge.png'), fullPage: false });
  console.log('Forge captured');
  await forgeCtx.close();

  // Builder - clicks BUILD nav button
  const builderCtx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const builderPage = await builderCtx.newPage();
  await builderPage.goto('http://127.0.0.1:9000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await builderPage.waitForTimeout(5000);
  const newBtn = await builderPage.locator('button:has-text("NEW")').first();
  if (await newBtn.isVisible()) await newBtn.click();
  await builderPage.waitForTimeout(2000);
  await builderPage.screenshot({ path: resolve(docsDir, 'builder.png'), fullPage: false });
  console.log('Builder captured');
  await builderCtx.close();

  await browser.close();
  console.log('Done!');
}

captureScreenshots().catch(console.error);