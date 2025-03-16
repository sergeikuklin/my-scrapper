import { CronJob } from 'cron';
import puppeteer from 'puppeteer';
import { sendMessage } from './sendMessage.js';

const url = 'https://service.berlin.de/dienstleistung/351180/';

export const checkTerminPage = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    console.log('opening page');
    await page.goto(url);
    console.log('finished loading page');

    await page.screenshot({ path: 'screenshot.png' });

    console.log('Waiting for selector...');
    await page.waitForSelector('div.servicepanel__right > a.button--negative', {
      visible: true,
    });
    console.log('Selector found!');

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
  cronTime: '0 */3 * * * *',
  onTick: function () {
    const d = new Date();
    console.log('Every 3 min:', d);
    console.log('Checking Termin Page');

    checkTerminPage();
  },
  start: true,
});
