FROM node:10.13-stretch

RUN apt-get update && apt-get install -y \
    firefox-esr

WORKDIR /assets

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . /assets

RUN npm run build
