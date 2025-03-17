import { CheckBurgerTestTerminJob } from './checkBurgerTestTerminJob.ts';
import { Notifier, TelegramChannel } from './notifications.ts';

export const startJobs = async () => {
  const token = process.env.TELEGRAM_TOKEN ?? '';
  const telegramChannel = await TelegramChannel.init(token);
  const notification = new Notifier(telegramChannel);

  const checkBurgerTestTerminJob = new CheckBurgerTestTerminJob(notification);
  checkBurgerTestTerminJob.start();
};
