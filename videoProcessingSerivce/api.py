from flask import Flask
from flask import request
import yt
import ffmpeg_processing
import os

app = Flask(__name__)

DATABASE_VIDS_TABLE = {}  # Should use sqlite server for this


@app.route("/API/process-yt-video", methods=["POST"])
def handle_video_dl():
    json_req = request.json

    vid_paths = yt.download_yt_video(json_req.get("vid_id"))

    clip_list, _ = ffmpeg_processing.create_clips(
        vid_paths["vid"], vid_paths["clip_folder"])

    clips_paths = ffmpeg_processing.create_frames(
        vid_paths["clip_folder"], vid_paths["frames_folders"], clip_list)

    DATABASE_VIDS_TABLE[json_req.get("vid_id")] = {
        "vid_path": vid_paths,
        "clip_list": clip_list,
        "clip_folders": clips_paths,
    }

    print(DATABASE_VIDS_TABLE)

    clips_timecodes = []
    for i, clips in enumerate(clip_list):
        clips_timecodes.append({
            "start": clips[0].get_seconds(),
            "end": clips[1].get_seconds(),
            "num_frames": len(os.listdir(clips_paths[i]))
        })

    return {
        "ok": True,
        "clips": clips_timecodes
    }


@app.route("/API/frames-from-video", methods=["POST"])
def handle_clips():
    json_req = request.json
    vid = DATABASE_VIDS_TABLE[json_req.get("vid_id")]

    img_list = ffmpeg_processing.frames_to_base64_list(
        vid["clip_folders"][json_req.get("clip_index") + 1])

    for i in range(0, len(img_list)):
        img_list[i] = str(img_list[i])

    return {
        "ok": True,
        "vid_id": json_req.get("vid_id"),
        "frames": img_list
    }


@app.route("/API/get-video-info", methods=["GET"])
def handle_yt_info():
    json_req = request.json
    info = yt.get_yt_info(json_req.get("vid_id"))

    return info
