# Embedder

This service takes a JSON that stores all the data created by the Butcher and then adds it to a job queue in Redis. It then pulls from that job queue and tries to process all the information gathered about the video and gives it to GPT-4 to try and create a detailed description for each key frame we were able to find. We then embed all that information and store it into the PostgresSQL vector store for use by the ChatAPI

**Tech Breakdown:**

- Node.js + TS + Express: Used to create a simple REST API
- BULL: Manage Redis queue 
- LangChain: Handle prompts and embedding 

### Notes

Using Node.js v21.2.0 & pnpm

```bash 
pnpm install
```

**Setup .env**

```.env
OPENAI_API_KEY=""
DB_HOST=""
DB_PORT=0000
DB_USER=""
DB_PWD=""
DB_DATABASE_NAME=""
REDIS_SERVER_HOST=""
REDIS_SERVER_PORT=""
SHOULD_RUN_JOB=true || false
```
**Run Dev**

```bash
pnpm run dev
```

**Run Production**

```bash
pnpm run start
```