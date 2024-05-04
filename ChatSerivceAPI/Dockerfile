FROM node:21.2.0-alpine

COPY . ./app
WORKDIR /app

RUN npm install -g pnpm
RUN pnpm install

CMD pnpm run start