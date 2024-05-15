# ChatAPI

Grabs data from the PostgresSQL vector store and then gives it to OpenAI GPT-3.5 model to create chat messages for the user. It also allows for searching of the PostgresSQL vector store, able to get back audio transcriptions and key frames from the video.

**Tech Breakdown:**

- Node.js + TS + Express: Used to create a simple REST API

## Setup ChatAPI

Setup .env file

```.env
OPENAI_API_KEY=""
DB_HOST=""
DB_PORT=0000
DB_USER=""
DB_PWD=""
DB_DATABASE_NAME=""
PORT=0000
```

**Run**

```bash
pnpm run dev
```