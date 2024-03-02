import uuid
import os

from flask import Flask
from flask import request
from werkzeug.utils import secure_filename

import src.utils as utils
import src.worker as queue

import config


ALLOWED_EXTENSIONS = {'mp4', 'mkv'}

app = Flask(__name__)
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
            # folders = utils.create_work_folders(file_id)

            # Save file and encode to 720p
            video_path = os.path.join(file_path, filename)
            file.save(video_path)

            queue.worker_pool.submit(queue.worker,
                                     file_id,
                                     title,
                                     video_path)

            # queue.worker(file_id,
            #                     title,
            #                     video_path)

            return {
                "ok": True
            }, 202
