import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });

  const consoleLogs = [];
  const errors = [];

  page.on('console', msg => {
    consoleLogs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    if (msg.type() === 'error') console.error(`  CONSOLE: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    errors.push(err.message);
    console.error(`  FATAL: ${err.message}`);
  });

  console.log('Loading http://127.0.0.1:9000...');
  
  try {
    await page.goto('http://127.0.0.1:9000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('Page loaded (DOM)');
  } catch (e) {
    console.error(`Could not load: ${e.message}`);
  }

  // Wait for React to render
  await page.waitForTimeout(5000);
  
  // Screenshot
  await page.screenshot({ path: 'diagnostic-screenshot.png', fullPage: false });
  console.log('Screenshot saved: diagnostic-screenshot.png');

  // Check DOM
  const bodyHTML = await page.evaluate(() => document.body.innerHTML.substring(0, 2000));
  console.log('\nBody HTML (first 2000 chars):');
  console.log(bodyHTML);

  const rootHTML = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root ? root.innerHTML.substring(0, 1500) : 'NO ROOT ELEMENT';
  });
  console.log('\n#root HTML:');
  console.log(rootHTML);

  // Check for loading overlay
  const loadingText = await page.evaluate(() => {
    const el = document.body.innerText;
    return el.substring(0, 500);
  });
  console.log('\nVisible text:');
  console.log(loadingText || '(empty)');

  // Check if any elements exist
  const elementCount = await page.evaluate(() => document.querySelectorAll('*').length);
  console.log(`\nTotal DOM elements: ${elementCount}`);

  // Check for React root
  const reactRoot = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return 'No #root found';
    const keys = Object.keys(root);
    const reactKey = keys.find(k => k.startsWith('__react') || k.startsWith('_react'));
    return reactKey ? `React fiber found: ${reactKey}` : `No React fiber. Keys: ${keys.join(', ')}`;
  });
  console.log(`\nReact status: ${reactRoot}`);

  // All console logs
  if (consoleLogs.length > 0) {
    console.log('\nConsole logs:');
    consoleLogs.forEach(l => console.log(`  ${l}`));
  }

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  ${e}`));
  }

  // Check network resources
  console.log('\nNetwork resources:');
  const requests = await page.evaluate(() => {
    return performance.getEntriesByType('resource').map(r => ({
      name: r.name.substring(0, 80),
      type: r.initiatorType,
      duration: Math.round(r.duration),
    }));
  });
  requests.forEach(r => console.log(`  ${r.type}: ${r.name} (${r.duration}ms)`));

  await browser.close();
  console.log('\nDiagnosis complete');
}

diagnose().catch(console.error);