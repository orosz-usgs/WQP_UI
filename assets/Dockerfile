FROM node:10.13-stretch

RUN apt-get update && apt-get install -y \
    chromium
ENV CHROME_BIN /usr/bin/chromium

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . /app

USER node
