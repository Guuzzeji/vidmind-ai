from flask import Flask
from flask import request
import youtube
import video_processing
import os
import base64

app = Flask(__name__)

DATABASE_VIDS_TABLE = {}  # Should use sqlite server for this


@app.route("/API/process-yt-video", methods=["POST"])
def handle_video_dl():
    json_req = request.json

    # Checking temp database for speed
    if json_req.get("vid_id") in DATABASE_VIDS_TABLE:
        return {
            "ok": True,
            "clips": DATABASE_VIDS_TABLE[json_req.get("vid_id")]["clip_list"],
            "vid_paths": DATABASE_VIDS_TABLE[json_req.get("vid_id")]["vid_paths"]
        }

    vid_paths = youtube.download_yt_video(json_req.get("vid_id"))
    clip_list = video_processing.create_clips(
        vid_paths["vid"], vid_paths["clip_folder"])

    # Getting clips from ffmpeg processing video
    clip_files = os.listdir(vid_paths["clip_folder"])

    # Taking thoses clips and breaking them down into frame strips
    for file in clip_files:
        file_name = file.removesuffix(".mp4")
        if file_name.isdigit():
            video_processing.extract_frames(
                os.path.join(vid_paths["clip_folder"], file),
                vid_paths["frame_folder"],
                file_name)

    DATABASE_VIDS_TABLE[json_req.get("vid_id")] = {
        "vid_paths": vid_paths,
        "clip_list": clip_list,
    }

    print(DATABASE_VIDS_TABLE)

    return {
        "ok": True,
        "clips": clip_list,
        "vid_paths": vid_paths,
    }


@app.route("/API/frames-from-video", methods=["POST"])
def handle_clips():
    json_req = request.json
    vid = DATABASE_VIDS_TABLE[json_req.get("vid_id")]
    files = os.listdir(vid["vid_paths"]["frame_folder"])

    # Finding the frame we want to send back as base64
    for file in files:
        file_name = file.split(".")[0]
        if file_name.isdigit() and (int(file_name) == int(json_req.get("clip_num"))):
            with open(os.path.join(vid["vid_paths"]["frame_folder"], file), "rb") as image_file:
                data = base64.b64encode(image_file.read())

            return {
                "ok": True,
                "vid_id": json_req.get("vid_id"),
                "clip_num": json_req.get("clip_num"),
                "frames": str(data).removeprefix("b'").removesuffix("'")
            }

    return {
        "ok": False,
        "error": "not a clip index"
    }


@app.route("/API/get-video-info", methods=["POST"])
def handle_yt_info():
    json_req = request.json
    info = youtube.get_yt_info(json_req.get("vid_id"))

    return info
