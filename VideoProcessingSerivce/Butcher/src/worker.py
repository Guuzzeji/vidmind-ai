import json
import os
import concurrent.futures
import redis

from src.video.ContentExtractor import ContentExtractor
from src import s3_client

# Should use streams
# https://www.youtube.com/watch?v=rBlnHJZKD_M&t=459s
# https://www.linkedin.com/pulse/redis-streams-real-time-data-processing-powerhouse-appasaheb-salunke-jaa9f
r = redis.Redis(
    host="127.0.0.1",
    port=6379
)


def worker(video_id: str, title: str, video_path: str):

    video_breakdown = ContentExtractor(video_path, video_id)
    video_breakdown.get_content()

    # Upload files
    audio_urls = s3_client.upload_folder(
        video_breakdown.folder_location["audio_folder"],
        "audio",
        video_id)

    frame_url_table = {}
    for folder in os.listdir(video_breakdown.folder_location["frame_folder"]):
        path_subframe_folder = os.path.join(
            video_breakdown.folder_location["frame_folder"],
            folder)

        urls = s3_client.upload_folder(
            path_subframe_folder,
            "frame/"+folder,
            video_id)
        frame_url_table[folder] = urls

    video_breakdown.delete_work_folder()

    # Adding everything into a single object
    chunk_clip_list = []
    for chunk in video_breakdown.timestamps:
        chunk_clip_list.append({
            "id": chunk.get("id"),
            "startTime": chunk.get("start"),
            "endTime": chunk.get("end"),
            "frameTimestamps": chunk.get("imgs_timestamps"),
            "audioUrl": audio_urls[str(chunk.get("id"))+".mp3"],
            "frameUrl": frame_url_table[str(chunk.get("id"))]
        })

    package_msg = {
        "id": video_id,
        "title": title,
        "clipChunks": chunk_clip_list
    }

    r.xadd("EMBED_TICKETS", {"data": json.dumps(package_msg)})


worker_pool = concurrent.futures.ThreadPoolExecutor(max_workers=3)
