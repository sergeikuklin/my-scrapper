FROM 22.14.0-alpine3.20

WORKDIR alice-berlin-transport

COPY package*.json ./
RUN npm ci

COPY . .
CMD ["npm" , "start"]
