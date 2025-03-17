import { CronJob } from 'cron';
import puppeteer from 'puppeteer';
import { Notifier } from './notifications.ts';

const siteUrl =
  'https://service.berlin.de/terminvereinbarung/termin/all/351180/';

const url = `http://api.scrape.do?token=466837969b96418f82ecbfc93c7773492858172618b&url=${siteUrl}`;

interface BrowserJob {
  start(): void;
  tick(): void;
}

export class CheckBurgerTestTerminJob implements BrowserJob {
  constructor(private notification: Notifier) {
    this.notification = notification;
  }

  get job() {
    return CronJob.from({
      cronTime: '0 */2 * * * *',
      onTick: this.tick.bind(this),
      runOnInit: true,
    });
  }

  start(): void {
    this.job.start();
  }

  async tick() {
    const d = new Date();
    console.log('Every 2 min:', d);
    console.log('Checking Termin Page');

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      console.log('opening page');
      await page.goto(url, { waitUntil: 'networkidle0' });
      console.log('finished loading page');

      const terminPageIsNotAvailable = await page.evaluate(() => {
        return (
          document.body.innerText.includes(
            'Leider sind aktuell keine Termine für ihre Auswahl verfügbar.'
          ) || document.body.innerText.includes('Wartung')
        );
      });

      console.log('terminPageIsNotAvailable', terminPageIsNotAvailable);

      await page.screenshot({ path: 'screenshot.png' });

      if (!terminPageIsNotAvailable) {
        console.log('sending notification');
        await this.notification.sendMessages({
          text: `Есть свободные слоты: ${page.url()}`,
          photo: 'screenshot.png',
        });
      }

      await this.notification.sendMessages({
        text: `test`,
        photo: 'screenshot.png',
      });
    } catch (e) {
      console.error(e);
      await this.notification.sendMessages({
        text: 'Ошибка при проверке страницы термина',
      });
    } finally {
      console.log('closing browser');
      await browser.close();
    }
  }
}
