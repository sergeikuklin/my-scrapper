FROM node:18-alpine

WORKDIR alice-berlin-transport

COPY package*.json ./
RUN npm ci

COPY . .
