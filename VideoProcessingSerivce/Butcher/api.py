from flask import Flask
from flask import request
from werkzeug.utils import secure_filename
import uuid
import video_chopper
import os
import config
import utils
import s3_client

app = Flask(__name__)
ALLOWED_EXTENSIONS = {'mp4', 'mkv'}


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
        if file.filename == '' or request.form.get("title") is None or request.form.get("title") is "":
            return {
                "error": True
            }

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

            utils.delete_work_folder(file_path)

            return {
                "ok": True,
                "id": file_id,
                "title": title,
                "frames": frame_urls,
                "audio_urls": audio_urls,
                "time_code": segment_time
            }
