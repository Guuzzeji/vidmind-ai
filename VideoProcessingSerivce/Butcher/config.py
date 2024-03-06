import os
import sys
from dotenv import load_dotenv

load_dotenv(sys.argv[1])

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

REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = os.getenv('REDIS_PORT')
REDIS_QUEUE_NAME = os.getenv('REDIS_QUEUE_NAME')

if os.getenv('S3_DEV_MODE') == 'YES':
    S3_SECURE = False

if os.getenv('DEBUG') == 'YES':
    DEBUG = True
