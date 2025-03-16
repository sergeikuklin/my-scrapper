FROM node:18-alpine

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install dependencies required by Puppeteer
RUN apt-get update && apt-get install curl gnupg -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install google-chrome-stable -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

WORKDIR my-scrapper

COPY package*.json ./
RUN npm ci

COPY . .
EXPOSE 6000

CMD ["npm" , "start"]
