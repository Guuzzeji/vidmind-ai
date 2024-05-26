# Butcher

This service processes the video into chunks (we aim to create 50 chunks from a video, so if we have a 1-hour-long video, we should get 50 chunks that are 1 minute per chunk). And from those chunks, we then start extracting audio and key frames that we will then give to the Embedder for processing with GPT-4 model and creating embeddings for us to put into the PostgresSQL vector store.

**Tech Breakdown:**

- Python + Flask: Handle uploads of files and create an HTTP API that can be used
- FFMPEG: Chunking videos into segments that can be further processed
- PySceneDetect: Getting the most important frames from a video chunk

**Notes**

How to calculate total video chunks and the number of seconds for video chunk:

Percentage can be, for example, 0.002, which is 2%

Total time seconds / (total time seconds * percentage) = number of clips

Total time seconds * percentage = number of seconds per clip

### Config
Using python 3.10.7 & pip 23.3.2

### Setup

```bash
pip install virtualenv
```

```bash
virtualenv venv
```

```bash
source venv/bin/activate
```

```bash
pip install -r requirements.txt
```

Setup `.env`

```.env
WORKING_DIR="" // Name of Work dir
HOST=0.0.0.0
PORT=0000
DEBUG=YES || NO
S3_HOST=EXAMPLE:0000
S3_KEY=""
S3_PWD=""
S3_DEV_MODE=YES || NO
S3_BUCKET_NAME=""
```

**Run Serivce**

```bash
 python main.py .env
```