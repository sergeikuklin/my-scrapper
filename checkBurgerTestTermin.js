import { CronJob } from 'cron';
import puppeteer from 'puppeteer';
import { sendMessage } from './sendMessage.js';

const url = 'https://service.berlin.de/dienstleistung/351180/';

const checkTerminPage = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    console.log('opening page');
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.setViewport({ width: 1080, height: 1024 });
    console.log('finished loading page');

    await page.waitForSelector('div.servicepanel__right > a.button--negative', {
      timeout: 60000,
      visible: true,
    });

    await page.evaluate(() => {
      const element = document.querySelector(
        'div.servicepanel__right > a.button--negative'
      );
      if (!element) throw new Error('Button not found');
      element.click();
    });

    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    console.log('Page changed to:', page.url());

    const terminPageIsNotAvailable = await page.evaluate(() => {
      return (
        document.body.innerText.includes(
          'Leider sind aktuell keine Termine für ihre Auswahl verfügbar.'
        ) || document.body.innerText.includes('Wartung')
      );
    });

    if (!terminPageIsNotAvailable) {
      await sendMessage(`Проверьте страницу термина ${page.url()}`);
    }
  } catch (e) {
    console.error(e);
    await sendMessage('Ошибка при проверке страницы термина');
  } finally {
    await browser.close();
  }
};

export const checkBurgerTestTerminJob = CronJob.from({
  cronTime: '0 */2 * * * *',
  onTick: function () {
    const d = new Date();
    console.log('Every 2 min:', d);
    console.log('Checking Termin Page');

    checkTerminPage();
  },
  start: true,
});
