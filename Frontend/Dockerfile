FROM node:21.2.0-alpine

COPY ./chat-ui ./app
WORKDIR /app

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build
RUN npm install -g serve

CMD serve -s build -l $PORT