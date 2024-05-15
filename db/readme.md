# Setup Docker Serivce DB, Redis, S3

Example of `.env` file

```txt
POSTGRES_USER=""
POSTGRES_PASSWORD=""
POSTGRES_HOST_AUTH_METHOD=trust // should switch off in production
MINIO_ROOT_USER=""
MINIO_ROOT_PASSWORD=""
```

**Run before doing anything else, setup db s3, redis**

```bash
docker-compose --env-file .env up 
```