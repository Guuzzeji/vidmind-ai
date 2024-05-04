import json
import os

from minio import Minio
from minio.error import S3Error

import config

BUCKET_NAME = config.S3_BUCKET_NAME
BASE_URL_S3 = "http://" + config.S3_HOST + "/"
client = Minio(config.S3_HOST,
               access_key=config.S3_KEY,
               secret_key=config.S3_PWD,
               secure=config.S3_SECURE  # Set to false to disable SSL and work on devloper server
               )

# From: https://min.io/docs/minio/linux/developers/python/API.html#set_bucket_policy
# https://thomascenni.com/blog/minio-bucket-anonymous-download/
# Set bucket policy to read only
policy = {
    "Statement": [{
        "Action": ["s3:GetBucketLocation"],
        "Effect": "Allow",
        "Principal": {
            "AWS": ["*"]
        },
        "Resource": ["arn:aws:s3:::" + BUCKET_NAME]
    }, {
        "Action": ["s3:GetObject"],
        "Effect": "Allow",
        "Principal": {
            "AWS": ["*"]
        },
        "Resource": ["arn:aws:s3:::" + BUCKET_NAME + "/*"]
    }],
    "Version": "2012-10-17"
}

client.set_bucket_policy(BUCKET_NAME, json.dumps(policy))


def upload_file(s3_folder_id: str, file_source: str, file_name: str, folder_name: str) -> str:
    client.fput_object(BUCKET_NAME,
                       s3_folder_id + "/" + folder_name + "/" + file_name,
                       file_source)
    return BASE_URL_S3 + BUCKET_NAME + "/" + s3_folder_id + "/" + folder_name + "/" + file_name


def upload_folder(folder_path: str, folder_name: str, s3_folder_id: str) -> list[str]:
    # Upload files
    files = os.listdir(folder_path)
    s3_urls = {}
    for file in files:
        path_to_file = os.path.join(folder_path, file)
        url = upload_file(s3_folder_id, path_to_file, file, folder_name)
        s3_urls[file] = url

    return s3_urls
