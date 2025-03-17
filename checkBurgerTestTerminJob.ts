import { CronJob } from 'cron';
import puppeteer from 'puppeteer';
import { Notifier } from './notifications.ts';

const url = 'https://service.berlin.de/terminvereinbarung/termin/all/351180/';

const proxyUrl = new URL(process.env.PROXY_URL ?? '');

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
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        `--proxy-server=${proxyUrl.hostname}:${proxyUrl.port}`,
      ],
    });

    try {
      const page = await browser.newPage();
      await page.authenticate({
        username: proxyUrl.username,
        password: proxyUrl.password,
      });
      console.log('opening page');

      await page.goto(url, { waitUntil: 'networkidle0' });
      console.log('finished loading page');

      const terminPageIsAvailable = await page.evaluate(() => {
        return (
          document.body.innerText.includes('Service-Portal') &&
          document.body.innerText.includes('Terminvereinbarung')
        );
      });

      await page.screenshot({ path: 'screenshot.png' });

      if (terminPageIsAvailable) {
        console.log('sending notification');
        await page.screenshot({ path: 'screenshot.png' });
        await this.notification.sendMessages({
          text: `Есть свободные слоты: ${page.url()}`,
          photo: 'screenshot.png',
        });
      }
    } catch (e) {
      console.error(e);
      await this.notification.sendMessages({
        text: `Произошла при проверке слотов`,
        photo: 'screenshot.png',
      });
    } finally {
      console.log('closing browser');
      await browser.close();
    }
  }
}
