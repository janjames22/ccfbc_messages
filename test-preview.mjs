import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

    console.log('Navigating to http://localhost:4173');
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
    
    const content = await page.content();
    if (content.includes('Something went wrong')) {
      console.log('FOUND ERROR BOUNDARY ON PAGE');
    } else {
      console.log('Page loaded normally');
    }

    await browser.close();
  } catch (err) {
    console.error('Script failed:', err);
  }
})();
