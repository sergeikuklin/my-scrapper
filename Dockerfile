
FROM node:18-slim

# Install necessary dependencies for Puppeteer to run Chromium
FROM node:18-slim

# Install necessary dependencies for Puppeteer and Node.js to handle worker threads
RUN apt-get update && apt-get install -y \
  curl \
  ca-certificates \
  libssl-dev \
  libv8-dev \
  libicu-dev \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  wget \
  libc6-dev \
  libpthread-stubs0-dev \
  libglib2.0-dev \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Install Chromium
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && dpkg -i google-chrome-stable_current_amd64.deb \
    || apt-get install -f -y

WORKDIR my-scrapper

COPY package*.json ./
RUN npm ci

COPY . .
EXPOSE 6000

CMD ["npm" , "start"]
