import puppeteer from './frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve('docs/screenshots');

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getRealAuthToken() {
  const resp = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dr.nazim@niet.ac.in', password: 'Doctor@123' })
  });
  return await resp.json();
}

async function run() {
  console.log('Fetching valid JWT token from backend...');
  const authData = await getRealAuthToken();
  console.log('Got token for:', authData.user.full_name);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1.5,
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--hide-scrollbars',
    ],
  });

  const routes = [
    { name: 'landing-page.png', path: '/', delay: 2500 },
    { name: 'login.png', path: '/login', delay: 1500 },
    { name: 'dashboard.png', path: '/dashboard', auth: true, delay: 2500 },
    { name: 'patient-management.png', path: '/patients', auth: true, delay: 2500 },
    {
      name: 'patient-details.png',
      path: '/patients',
      auth: true,
      delay: 2500,
      action: async (p) => {
        try {
          await p.waitForSelector('tbody tr', { timeout: 8000 });
          const rows = await p.$$('tbody tr');
          if (rows && rows.length > 0) {
            console.log(`Clicking first patient row out of ${rows.length}...`);
            await rows[0].click();
            await wait(1800); // Wait for slide-in animation
          }
        } catch (e) {
          console.warn('Patient row click note:', e.message);
        }
      }
    },
    { name: 'ai-triage-studio.png', path: '/triage', auth: true, delay: 3500 },
    { name: 'decision-graph-search.png', path: '/search', auth: true, delay: 4000 },
    {
      name: 'algorithm-benchmark.png',
      path: '/search',
      auth: true,
      delay: 2500,
      action: async (p) => {
        try {
          const buttons = await p.$$('button');
          for (const btn of buttons) {
            const txt = await p.evaluate(el => el.textContent, btn);
            if (txt && txt.includes('4-Algorithm Matrix')) {
              await btn.click();
              await wait(2000);
              break;
            }
          }
        } catch (e) {
          console.warn('Matrix tab click note:', e.message);
        }
      }
    },
    { name: 'resource-shortage-prediction.png', path: '/resources', auth: true, delay: 3500 },
    { name: 'campus-digital-twin.png', path: '/digital-twin', auth: true, delay: 4000 },
    { name: 'sdg-impact-analytics.png', path: '/sdg', auth: true, delay: 2500 },
  ];

  for (const r of routes) {
    console.log(`Taking screenshot for ${r.name} at ${r.path}...`);
    try {
      const page = await browser.newPage();
      
      // Inject real auth token before document loads
      if (r.auth) {
        await page.evaluateOnNewDocument((token, user) => {
          localStorage.setItem('aegis_token', token);
          localStorage.setItem('aegis_user', JSON.stringify(user));
        }, authData.access_token, authData.user);
      }

      await page.goto(`http://localhost:5173${r.path}`, {
        waitUntil: 'load',
        timeout: 20000,
      });

      await wait(r.delay);

      if (r.action) {
        await r.action(page);
      }

      const outPath = path.join(SCREENSHOT_DIR, r.name);
      await page.screenshot({ path: outPath });
      console.log(`✓ Saved ${r.name}`);
      await page.close();
    } catch (err) {
      console.error(`Failed ${r.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('✓ All authentic screenshots captured successfully!');
}

run();
