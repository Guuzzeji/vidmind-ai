import os
import requests
import re
from pytube import YouTube
import config

# ! May want to switch this to bufferio, can do this using stream_to_buffer
# ! https://pytube.io/en/latest/api.html#pytube.Stream.stream_to_buffer


def download_yt_video(vid_id: str) -> dict[str, str]:
    vid_path = os.path.join(config.CURRENT_PATH, config.WORKING_DIR, vid_id)

    clips_path = os.path.join(vid_path, "clips")

    os.mkdir(vid_path)
    os.mkdir(clips_path)

    yt = YouTube("https://www.youtube.com/watch?v="+vid_id)
    yt.streams.filter(resolution="720p", only_video=True).first().download(
        output_path=vid_path, filename="video.mp4")

    yt.streams.filter(only_audio=True, progressive=False).first().download(
        output_path=vid_path, filename="audio.mp3")

    return {
        "vid": os.path.join(vid_path, "video.mp4"),
        "audio": os.path.join(vid_path, "audio.mp3"),
        "clip_folder": clips_path,
        "vid_folder": vid_path
    }


def get_yt_info(vid_id: str) -> dict[str, str]:
    url = "https://www.youtube.com/watch?v="+vid_id
    yt = YouTube(url)

    # From https://github.com/pytube/pytube/issues/1626
    # ! Hot fix for getting video description
    full_html = requests.get(url).text
    y = re.search(r'shortDescription":"', full_html)
    desc = ""
    count = y.start() + 19  # adding the length of the 'shortDescription":"
    while True:
        # get the letter at current index in text
        letter = full_html[count]
        if letter == "\"":
            if full_html[count - 1] == "\\":
                # this is case where the letter before is a backslash, meaning it is not real end of description
                desc += letter
                count += 1
            else:
                break
        else:
            desc += letter
            count += 1

    return {
        "description": desc,
        "keywords": yt.keywords,
        "title": yt.title,
        # "metadata": yt.metadata,
        "publish_date": yt.publish_date
    }
