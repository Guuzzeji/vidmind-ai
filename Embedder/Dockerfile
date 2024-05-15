FROM node:21.2.0

COPY . ./app
WORKDIR /app

RUN npm install -g pnpm
RUN pnpm install

# CMD pnpm run start