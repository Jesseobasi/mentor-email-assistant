import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching puppeteer...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  console.log('Going to URL...');
  await page.goto('https://www.morgan.edu/academic-calendar', { waitUntil: 'networkidle2' });
  console.log('Evaluating page...');
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText, href: a.href }));
  });
  console.log(links.filter(l => l.text.toLowerCase().includes('calendar') || l.href.includes('.pdf') || l.href.includes('.docx')));
  await browser.close();
})();
