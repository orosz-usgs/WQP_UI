FROM node:10.13-stretch

RUN apt-get update && apt-get install -y \
    firefox-esr

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . /app

USER node
