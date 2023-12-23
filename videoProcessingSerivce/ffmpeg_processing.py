import os
import base64
from scenedetect import detect, AdaptiveDetector, split_video_ffmpeg, video_splitter
from ffmpeg import FFmpeg

# ! Note: may want to switch to
# ! using pipe with this https://stackoverflow.com/questions/72100457/use-bytesio-into-python-ffmpeg-or-other
# ! https://superuser.com/questions/1047660/ffmpeg-pipe-images-extracted-from-video

# ! Can also do piping using scencdetect
# ! https://www.scenedetect.com/docs/0.6.1/api/backends.html
# ! https://stackoverflow.com/questions/46624449/load-bytesio-image-with-opencv
# ! can just load from YT URL, https://stackoverflow.com/questions/46636195/read-video-from-bytes

video_splitter.DEFAULT_FFMPEG_ARGS = '-map 0 -c:v libx264 -preset veryfast -crf 32 -c:a aac'


def create_clips(vid_path: str, clips_path: str) -> (list, bool):
    save_clips_path = os.path.join(clips_path, "$SCENE_NUMBER.mp4")

    try:
        scene_list = detect(
            vid_path, AdaptiveDetector(adaptive_threshold=4.5, min_scene_len=60))
        split_video_ffmpeg(
            vid_path, scene_list,  output_file_template=save_clips_path, show_progress=True)

        return scene_list, True

    except:
        return [], False


def create_frames(clips_path: str, frames_path: str, scene_list: list) -> list[str]:
    dir_list = []

    for i in range(1, len(scene_list) + 1):
        vid_clips_path = os.path.join(clips_path, str(i).zfill(3) + ".mp4")

        ffmpeg = FFmpeg()
        ffmpeg.option(
            "i", vid_clips_path)
        ffmpeg.option("f", "image2")
        # ffmpeg.option(
        #     "vf", "select=not(mod(n\,10))")  # Can do every 10 or 15 frames
        ffmpeg.option(
            "vf", "thumbnail=10")
        ffmpeg.option("vsync", "vfr")
        ffmpeg.option("qscale:v", "7")

        clip_frames_path = os.path.join(frames_path, "clip-"+str(i))
        dir_list.append(clip_frames_path)
        os.mkdir(clip_frames_path)

        save_path = os.path.join(
            clip_frames_path, "%03d.jpeg")
        ffmpeg.output(save_path)

        # print(ffmpeg.arguments)
        ffmpeg.execute()

    return dir_list


def frames_to_base64_list(path: str) -> list[str]:
    folder = os.listdir(path)
    base64_file_list = []

    for file in folder:
        file_path = os.path.join(path, file)

        with open(file_path, "rb") as image_file:
            data = base64.b64encode(image_file.read())

        base64_file_list.append(data)

    return base64_file_list
