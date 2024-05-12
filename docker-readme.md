## Setup Docker Serivce DB, REDIS, S3

# TODO: Break down file into different compose files since cannot run all at once
# TODO: Fix .env issue with some of the docker images
# TODO: Setup docker secrets, https://docs.docker.com/compose/use-secrets/
# TODO: Fix bugs in some of the serivces since moving to docker

# From: https://geshan.com.np/blog/2022/01/redis-docker/
# From: https://stackoverflow.com/questions/29377853/how-can-i-use-environment-variables-in-docker-compose
# How to use environment variables

# Notes
# - https://stackoverflow.com/questions/77355287/adding-local-minio-host-to-mc-configuration-failed-to-add-temporary-minio-ser
# - https://medium.com/@randy.hamzah.h/running-minio-server-with-docker-compose-54bab3afbe31

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