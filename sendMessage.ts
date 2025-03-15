import got from 'got';

export const sendMessage = (message: string) => {
  const token = process.env.TELEGRAM_TOKEN ?? '';
  const channel = process.env.CHAT_ID ?? '';
  return sendMessageFor(token, channel)(message);
};

const sendMessageFor = (token: string, channel: string) => {
  const baseUrl = `https://api.telegram.org/bot${token}`;

  return async (message) => {
    try {
      const response = await got.post<{ result: any }>(
        `${baseUrl}/sendMessage`,
        {
          json: {
            chat_id: channel,
            text: message,
          },
          responseType: 'json',
        }
      );

      return response.body;
    } catch (e) {
      console.error(e.response.body);
    }
  };
};
