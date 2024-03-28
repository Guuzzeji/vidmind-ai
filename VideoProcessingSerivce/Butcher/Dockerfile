FROM python:3.10-slim

ENV WORKING_DIR="WORKSPACE"
ENV HOST=
ENV PORT=
ENV DEBUG=
ENV S3_HOST=
ENV S3_KEY=
ENV S3_PWD=
ENV S3_DEV_MODE=
ENV S3_BUCKET_NAME=
ENV REDIS_HOST=
ENV REDIS_PORT=
ENV REDIS_QUEUE_NAME=

COPY . ./app
WORKDIR /app

RUN apt update
RUN apt install ffmpeg -y

RUN pip install gunicorn
RUN pip install -r requirements.txt

CMD gunicorn -w 3 'src.router.api:app'