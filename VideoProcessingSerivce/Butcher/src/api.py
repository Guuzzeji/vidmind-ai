import config
from src.worker import worker_run_task
from werkzeug.utils import secure_filename
from flask import request
from flask import Flask
import uuid
import os
import logging


logging.basicConfig(format='%(asctime)s - %(message)s',
                    datefmt='%d-%b-%y %H:%M:%S')
logging.getLogger().setLevel(logging.DEBUG)


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
            logging.info("No file...")
            return {
                "error": True
            }

        file = request.files['file']
        title = request.form.get("title")
        if file.filename == '' or request.form.get("title") is None or request.form.get("title") == "":
            logging.info("No title...")
            return {
                "error": True
            }

        logging.info("Creating file - " + file.filename)
        # Should create this into a queue later
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_id = str(uuid.uuid1())
            logging.info("File Setup - "
                         + "File ID:" + file_id
                         + " Filename:" + filename)

            # Creating working folder
            file_path = os.path.join(
                config.CURRENT_PATH, config.WORKING_DIR, file_id)
            os.mkdir(file_path)

            logging.info("File Download to Server - "
                         + "File ID:" + file_id
                         + " Filename:" + filename)
            video_path = os.path.join(file_path, filename)
            file.save(video_path)

            logging.info("Chopping Video - "
                         + "File ID:" + file_id
                         + " Filename:" + filename)
            worker_run_task(file_id, title, video_path)

            return {
                "ok": True,
                # "data": package_msg
            }, 202
