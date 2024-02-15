## Setup Docker Serivce DB, REDIS, S3

Setup .env file for .env.development.local or .env.production

Keep not of this because will have to copy these to other serivces to work

```.env
POSTGRES_DB=""
POSTGRES_USER=""
POSTGRES_PASSWORD=""
POSTGRES_HOST_AUTH_METHOD=trust // should switch off in production
MINIO_ROOT_USER=""
MINIO_ROOT_PASSWORD=""
MINIO_DEFAULT_BUCKETS=""
```

**Run before doing anything else, setup db s3, redis**

```bash
docker-compose --env-file .env.development.local up 
```