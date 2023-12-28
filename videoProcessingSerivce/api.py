from flask import Flask
from flask import request
import yt
import ffmpeg_processing

app = Flask(__name__)

DATABASE_VIDS_TABLE = {}  # Should use sqlite server for this


@app.route("/API/process-yt-video", methods=["POST"])
def handle_video_dl():
    json_req = request.json

    if json_req.get("vid_id") in DATABASE_VIDS_TABLE:
        return {
            "ok": True,
            "clips": DATABASE_VIDS_TABLE[json_req.get("vid_id")]["clip_list"]
        }

    vid_paths = yt.download_yt_video(json_req.get("vid_id"))

    clip_list = ffmpeg_processing.create_clips(
        vid_paths["vid"], vid_paths["clip_folder"])

    # use for cleaning up time code to be sent back to client
    clips_timecodes = []
    for clips in clip_list:
        clips_timecodes.append({
            "start": clips[0].get_seconds(),
            "end": clips[1].get_seconds(),
            # Each clip has 10 frames
        })

    DATABASE_VIDS_TABLE[json_req.get("vid_id")] = {
        "vid_paths": vid_paths,
        "clip_list": clips_timecodes,
        # "clip_folders": clips_paths,
    }

    print(DATABASE_VIDS_TABLE)

    return {
        "ok": True,
        "clips": clips_timecodes
    }


@app.route("/API/frames-from-video", methods=["POST"])
def handle_clips():
    json_req = request.json
    vid = DATABASE_VIDS_TABLE[json_req.get("vid_id")]

    img_list = ffmpeg_processing.frames_to_base64_list(
        vid["vid_paths"]["clip_folder"], int(json_req.get("clip_num")))

    # Convert to base64 that can be sent back
    for i in range(0, len(img_list)):
        img_list[i] = str(img_list[i]).removeprefix("b'")

    return {
        "ok": True,
        "vid_id": json_req.get("vid_id"),
        "clip_num": json_req.get("clip_num"),
        "frames": img_list
    }


@app.route("/API/get-video-info", methods=["POST"])
def handle_yt_info():
    json_req = request.json
    info = yt.get_yt_info(json_req.get("vid_id"))

    return info
