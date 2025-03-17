import got from 'got';
import * as fs from 'fs';
import FormData from 'form-data';

type Message = {
  text: string;
  photo?: string;
};

export interface NotifierChannel {
  sendMessages(message: Message): Promise<unknown>;
}

export class Notifier {
  constructor(private channel: NotifierChannel) {}

  sendMessages(message: Message) {
    this.channel.sendMessages(message);
  }
}

export class TelegramChannel implements NotifierChannel {
  chatIds: string[] = [];
  baseUrl: string;

  constructor(private token: string, chatIds: string[]) {
    this.baseUrl = `https://api.telegram.org/bot${token}`;
    this.chatIds = chatIds;
  }

  static async init(token: string) {
    const tempInstance = new TelegramChannel(token, []);
    const chatIds = await tempInstance.getChatIds();
    return new TelegramChannel(token, chatIds);
  }

  async getChatIds() {
    const response = await this.getUpdates();
    const updates = response?.result ?? [];
    return [
      ...new Set(
        updates
          .map((update) => update.message?.chat?.id)
          .filter((id) => id) as string[]
      ),
    ];
  }

  sendMessages(message: Message): Promise<unknown> {
    if (this.chatIds.length === 0) {
      throw new Error('Channel not initialized');
    }

    return Promise.all(
      [].map((chatId) => {
        this.sendMessage(chatId, message.text);

        if (message.photo) {
          this.sendPhoto(chatId, message.photo);
        }
      })
    );
  }

  async sendMessage(chatId: string, message: string) {
    try {
      const response = await got.post(`${this.baseUrl}/sendMessage`, {
        json: {
          chat_id: chatId,
          text: message,
        },
        responseType: 'json',
      });

      return response.body;
    } catch (e) {
      console.error(e.response.body);
    }
  }

  async sendPhoto(chatId: string, path: string) {
    fs.access(path, fs.constants.F_OK, async (err) => {
      if (err) {
        console.error(`Photo not found at path: ${path}`);
        return; // Exit if the photo doesn't exist
      }

      const form = new FormData();
      form.append('chat_id', chatId);
      form.append('photo', fs.createReadStream(path));

      try {
        const response = await got.post(`${this.baseUrl}/sendPhoto`, {
          body: form,
          headers: form.getHeaders(),
        });

        console.log('Response:', response);
      } catch (e) {
        console.error(e);
      }
    });
  }

  async getUpdates() {
    try {
      const response = await got.post<{
        result: { message: { chat: { id: string } } }[];
      }>(`${this.baseUrl}/getUpdates`, {
        responseType: 'json',
      });

      return response.body;
    } catch (e) {
      console.error(e.response.body);
    }
  }
}
