import os
import requests
import asyncio
import concurrent.futures

import config_env

from src import s3_client
from src.video.ContentExtractor import ContentExtractor

import logging
logging.basicConfig(format='%(asctime)s - %(message)s', datefmt='%d-%b-%y %H:%M:%S')
logging.getLogger().setLevel(logging.DEBUG)

worker_pool = concurrent.futures.ThreadPoolExecutor(max_workers=3)


def run_job(file_id: str, title: str, video_path: str):
    def run():
        asyncio.run(job(file_id, title, video_path))

    if config_env.DEBUG is not True:
        worker_pool.submit(run)
        return
    
    run()


async def job(video_id: str, title: str, video_path: str):
    video_breakdown = ContentExtractor(video_path, video_id)
    video_breakdown.get_content()

    # Upload files
    logging.info("S3 Upload Audio ID:" + video_id)
    audio_urls = s3_client.upload_folder(video_breakdown.folder_location["audio_folder"], "audio", video_id)

    logging.info("S3 Upload Frame ID:" + video_id)
    frame_url_table = {}
    for folder in os.listdir(video_breakdown.folder_location["frame_folder"]):
        path_subframe_folder = os.path.join(video_breakdown.folder_location["frame_folder"], folder)

        urls = s3_client.upload_folder(
            path_subframe_folder,
            "frame/"+folder,
            video_id)
        frame_url_table[folder] = urls

    video_breakdown.delete_work_folder()

    # Adding everything into a single object
    logging.info("Creating Embeder Ticket Package Video Id:" + video_id)
    chunk_clip_list = []
    for chunk in video_breakdown.timestamps:
        frame_chunks = []

        for frame in chunk.get("imgs_timestamps"):
            frame_copy = frame
            frame_copy["imgUrl"] = frame_url_table[str(chunk.get("id"))]['{:03d}.jpg'.format(frame_copy.get("id") + 1)]
            frame_chunks.append(frame_copy)

        chunk_clip_list.append({
            "id": chunk.get("id"),
            "startTime": chunk.get("start"),
            "endTime": chunk.get("end"),
            "frames": frame_chunks,
            "audioUrl": audio_urls[str(chunk.get("id"))+".mp3"],
        })

    package_msg = {
        "id": video_id,
        "title": title,
        "clipChunks": chunk_clip_list
    }

    logging.info("Sending Ticket to Embeder Video Id:" + video_id)
    requests.post(config_env.EMBED_QUEUE_URL, json=package_msg)

    # print(x.text)
    # return package_msg
