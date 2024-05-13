FROM node:21.2.0-alpine

COPY ./chat-ui ./app
WORKDIR /app

RUN npm install -g pnpm
CMD pnpm run start