FROM node:21.2.0-alpine

ENV PORT=8080
ENV REACT_APP_CHAT_API_URL="none"
ENV REACT_APP_UPLOAD_API_URL="none"

COPY ./chat-ui ./app
WORKDIR /app

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build
RUN npm install -g serve

CMD serve -s build -l $PORT