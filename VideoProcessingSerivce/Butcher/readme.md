# Butcher

### Notes
Using python 3.10.7 & pip 23.3.2

### Setup

```bash
pip install virtualenv
```

```bash
virtualenv video_processing_serivce
```

```bash
source video_processing_serivce/bin/activate
```

```bash
pip install -r requirements.txt
```

Setup .env.development.local file or .env.production file

```.env
## Example .env file setup

WORKING_DIR="" // Name of Work dir
HOST=0.0.0.0
PORT=0000
DEBUG=YES or NO
S3_HOST=EXAMPLE:0000
S3_KEY=""
S3_PWD=""
S3_DEV_MODE=YES or NO
S3_BUCKET_NAME=""
```

**Run Serivce**

```bash
 python main.py .env.your.file
```