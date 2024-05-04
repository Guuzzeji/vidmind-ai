FROM python:3.10-slim

COPY . ./app
WORKDIR /app

RUN apt update
RUN apt install ffmpeg -y

RUN pip install gunicorn
RUN pip install -r requirements.txt

CMD gunicorn -w 3 'src.router.api:app'