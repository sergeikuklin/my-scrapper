FROM node:22.14.0

WORKDIR my-scrapper

COPY package*.json ./
RUN npm ci

COPY . .
CMD ["npm" , "start"]
