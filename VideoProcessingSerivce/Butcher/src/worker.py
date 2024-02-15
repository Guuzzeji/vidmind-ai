import json
import concurrent.futures
import redis

import src.video.ffmpeg_commands as ffmpeg_commands
import src.s3_client as s3_client
import src.utils as utils

# Should use streams
# https://www.youtube.com/watch?v=rBlnHJZKD_M&t=459s
# https://www.linkedin.com/pulse/redis-streams-real-time-data-processing-powerhouse-appasaheb-salunke-jaa9f
r = redis.Redis(
    host="127.0.0.1",
    port=6379
)


def worker(video_id: str, folders: dict[str, str], title: str, video_path: str):

    rencode_video = ffmpeg_commands.encode_video(
        video_path, folders["vid_folder"], video_id)
    # Creating clips
    segment_time = ffmpeg_commands.create_clips(
        rencode_video, folders["clip_folder"])
    ffmpeg_commands.process_clips(
        folders["clip_folder"], folders["frame_folder"], folders["audio_folder"])

    # Upload files
    frame_urls = s3_client.upload_folder(
        folders["frame_folder"], "frames", video_id)
    audio_urls = s3_client.upload_folder(
        folders["audio_folder"], "audios", video_id)

    frame_urls.sort()
    audio_urls.sort()

    utils.delete_work_folder(folders["vid_folder"])

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
        "id": video_id,
        "title": title,
        "chunks": chunk_clip_list
    }

    r.xadd("EMBED_TICKETS", {"data": json.dumps(package_msg)})


worker_pool = concurrent.futures.ThreadPoolExecutor(max_workers=3)
