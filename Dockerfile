FROM node:18-slim

# Install dependencies required by Puppeteer
# Update and install required dependencies for Puppeteer and Chromium
RUN apt-get update && apt-get install -y \
  curl \
  gnupg \
  ca-certificates \
  fonts-liberation \
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
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Install Chromium from the Debian repository
RUN apt-get update && apt-get install -y chromium-browser --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR my-scrapper

COPY package*.json ./
RUN npm ci

COPY . .
EXPOSE 6000

CMD ["npm" , "start"]
