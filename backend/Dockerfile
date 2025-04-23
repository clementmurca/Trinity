# Development
FROM node:21.1-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

COPY .env /app/.env

EXPOSE 5001
CMD ["npm", "start"]

# Production
FROM node:21.1-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

COPY .env /app/.env

EXPOSE 5002
CMD ["node", "./server.js"]

# Tests
FROM node:21.1-bullseye AS test

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=test

CMD ["npm", "run", "test"]