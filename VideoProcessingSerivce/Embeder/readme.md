# Embeder

In charage of getting contents from s3 bucket and embeding it with openai and saving it to SQL db

### Notes

Using Node.js v21.2.0 & using pnpm

```bash 
pnpm install
```

Setup .env.development.local file or .env.production file

```.env
## Example .env file setup

OPENAI_API_KEY=""
DB_HOST=""
DB_PORT=0000
DB_USER=""
DB_PWD=""
DB_DATABASE_NAME=""
REDIS_URL=""
```

**Run Dev**

```bash
pnpm run startDev
```

**Run Production**

```bash
pnpm run startPro
```