import { chromium } from 'playwright';
import { createServer as createViteServer } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsDir = resolve(__dirname, 'docs', 'screenshots');

if (!existsSync(docsDir)) {
  mkdirSync(docsDir, { recursive: true });
}

const pages = [
  { name: 'home', view: 'gallery', description: 'Skill Directory - Browse and manage your AI skills' },
  { name: 'forge', view: 'forge', description: 'Skill Forge - AI-powered skill creation' },
  { name: 'builder', view: 'builder', description: 'Skill Builder - Fine-tune every detail' },
];

async function captureScreenshots() {
  // Start preview server
  const server = await createViteServer({
    root: resolve(__dirname, 'dist'),
    server: { port: 4173, host: true },
    preview: false,
    appType: 'custom',
  });
  
  await server.listen();
  console.log('🚀 Preview server running');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 917 }, // Pixel 7 dimensions
    deviceScaleFactor: 2.5,
  });
  
  const page = await context.newPage();
  
  for (const p of pages) {
    console.log(`📸 Capturing ${p.name}...`);
    try {
      await page.goto(`http://localhost:4173/?view=${p.view}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(1500);
      
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      
      const filename = resolve(docsDir, `${p.name}.png`);
      await page.screenshot({ path: filename, fullPage: false });
      console.log(`   ✅ Saved: ${p.name}.png`);
    } catch (e) {
      console.error(`   ❌ ${e.message}`);
    }
  }
  
  await browser.close();
  await server.close();
  console.log('✨ Done!');
}

captureScreenshots().catch(console.error);