from flask import Flask
from flask import request
from werkzeug.utils import secure_filename

import video_chopper
import s3_client

import redis

import config
import utils
import uuid
import json
import os


ALLOWED_EXTENSIONS = {'mp4', 'mkv'}

app = Flask(__name__)
r = redis.Redis(
    host="127.0.0.1",
    port=6379
)

# https://dev.to/rohit20001221/simple-pub-sub-system-using-redis-and-python-25jh


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/API/upload_video", methods=["POST"])
def handle_video_dl():
    if request.method == "POST":
        if 'file' not in request.files:
            return {
                "error": True
            }

        file = request.files['file']
        title = request.form.get("title")
        if file.filename == '' or request.form.get("title") is None or request.form.get("title") == "":
            return {
                "error": True
            }

        # Should create this into a queue later
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_id = str(uuid.uuid1())

            # Creating working folder
            file_path = os.path.join(
                config.CURRENT_PATH, config.WORKING_DIR, file_id)
            os.mkdir(file_path)
            folders = utils.create_work_folders(file_id)

            # Save file and encode to 720p
            video_path = os.path.join(file_path, filename)
            file.save(video_path)
            rencode_video = video_chopper.encode_video(video_path, file_path)

            # Creating clips
            segment_time = video_chopper.create_clips(
                rencode_video, folders["clip_folder"])
            video_chopper.process_clips(
                folders["clip_folder"], folders["frame_folder"], folders["audio_folder"])

            # Upload files
            frame_urls = s3_client.upload_folder(
                folders["frame_folder"], "frames", file_id)
            audio_urls = s3_client.upload_folder(
                folders["audio_folder"], "audios", file_id)

            frame_urls.sort()
            audio_urls.sort()

            utils.delete_work_folder(file_path)

            # Adding everything into a single object
            chunk_clip_list = []
            for x in range(len(segment_time)):
                chunk_clip_list.append({
                    "id": x,
                    "startTime": segment_time[x].get("start"),
                    "endTime": segment_time[x].get("end"),
                    "audio_url": audio_urls[x],
                    "frame_url": frame_urls[x]
                })

            package_msg = {
                "id": file_id,
                "title": title,
                "chunks": chunk_clip_list
            }

            # Should use streams
            # https://www.youtube.com/watch?v=rBlnHJZKD_M&t=459s
            # https://www.linkedin.com/pulse/redis-streams-real-time-data-processing-powerhouse-appasaheb-salunke-jaa9f
            r.xadd("EMBED_TICKETS", {"data": json.dumps(package_msg)})

            return {
                "ok": True
            }, 202
