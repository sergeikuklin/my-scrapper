import got from 'got';

interface Channel {
  sendMessages(message: string): Promise<unknown>;
}

export class Notification {
  constructor(private channel: Channel) {}

  sendMessages(message: string) {
    this.channel.sendMessages(message);
  }
}

export class TelegramChannel implements Channel {
  chatIds: string[] = [];
  baseUrl: string;
  static getChatIds: any;

  constructor(private token: string, chatIds: string[]) {
    this.baseUrl = `https://api.telegram.org/bot${token}`;
    this.chatIds = chatIds;
  }

  static async init(token: string) {
    const chatIds = await this.getChatIds();
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

  sendMessages(message: string): Promise<unknown> {
    if (this.chatIds.length === 0) {
      throw new Error('Channel not initialized');
    }

    return Promise.all(
      this.chatIds.map((chatId) => this.sendMessage(chatId, message))
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
