import {
  checkBurgerTestTerminJob,
  checkTerminPage,
} from './checkBurgerTestTermin.js';
import { sendMessage } from './sendMessage.js';

sendMessage(`Проверка страницы термина запущена`);

// checkBurgerTestTerminJob.start();
checkTerminPage();
