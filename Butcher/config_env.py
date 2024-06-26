import os
import sys
from dotenv import load_dotenv

if len(sys.argv) == 2 and sys.argv[1] != None:
    load_dotenv(sys.argv[1])
else:
    # Load whatever defualt .env is for the machine
    load_dotenv()

CURRENT_PATH = os.getcwd()
WORKING_DIR = os.getenv('WORKING_DIR')
HOST = os.getenv('HOST')
PORT = os.getenv('PORT')
DEBUG = False

S3_HOST = os.getenv('S3_HOST')
S3_KEY = os.getenv('S3_KEY')
S3_PWD = os.getenv('S3_PWD')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')
S3_SECURE = True

EMBED_QUEUE_URL = os.getenv('EMBED_QUEUE_URL')

if os.getenv('S3_DEV_MODE') == 'YES':
    S3_SECURE = False

if os.getenv('DEBUG') == 'YES':
    DEBUG = True
