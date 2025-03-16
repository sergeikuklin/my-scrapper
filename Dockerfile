FROM node:22.14.0

WORKDIR alice-berlin-transport

COPY package*.json ./
RUN npm ci

COPY . .
CMD ["npm" , "start"]
