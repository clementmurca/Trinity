FROM node:21.1-alpine AS development

WORKDIR /app

RUN apk add --no-cache git

COPY package.json package-lock.json* ./

RUN npm install lightningcss-linux-arm64-musl
RUN npm install

COPY . .

EXPOSE 19000 19001 19002 19006 8081 8082