
FROM node:22.14.0-alpine

RUN apk add --no-cache \
    udev \
    ttf-freefont \
    chromium

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Accept secret as a build argument
ARG TELEGRAM_TOKEN
ENV TELEGRAM_TOKEN=${TELEGRAM_TOKEN}

WORKDIR my-scrapper

COPY package*.json ./
RUN npm ci

COPY . .
EXPOSE 6000

CMD ["npm" , "start"]
