import os
from ffprobe import ffprobe
from ffmpeg import FFmpeg
from PIL import Image

# Good Stuff (Main idea behind video processing):
# - https://blog.gdeltproject.org/experiments-with-ffmpeg-scene-detection-to-explore-the-parallel-universe-of-russian-state-television-channel-russia1/


def create_clips(vid_path: str, clips_path: str) -> list[dict[str, int]]:
    ffmpeg = FFmpeg()
    save_path = os.path.join(clips_path, "%03d.mp4")

    # Getting time segment base on %4 rule, chunk video by a percentage (0.04)
    # This will give us 25 chunks to use when processing with GPT
    video_info = ffprobe(vid_path)
    seg_time = float(video_info.json.get("streams")[0].get("duration")) * 0.033

    # ffmpeg -i input.mp4 -map 0 -c copy -f segment -segment_time 1800 -reset_timestamps 1 output_%03d.mp4
    ffmpeg.option("i", vid_path)
    ffmpeg.option("map", 0)
    ffmpeg.option("c", "copy")
    ffmpeg.option("f", "segment")
    ffmpeg.option("segment_time", seg_time)
    ffmpeg.option("reset_timestamps", 1)
    ffmpeg.output(save_path)

    ffmpeg.execute()

    seg_list = create_segment_time_list(clips_path)
    return seg_list


def create_segment_time_list(clips_path: str) -> list[dict[str, float]]:
    folder = os.listdir(clips_path)
    seg_list = []

    for file in folder:
        video_path = os.path.join(clips_path, file)

        # Getting video info
        video_info = ffprobe(video_path).json.get("streams")[0]

        if seg_list == []:
            time_segment = {
                "start": 0,
                "end": float(video_info.get("duration"))
            }
            seg_list.append(time_segment)
        else:
            prev_time = seg_list[len(seg_list) - 1].get("end")
            time_segment = {
                "start": prev_time,
                "end": prev_time + float(video_info.get("duration"))
            }
            seg_list.append(time_segment)

    return seg_list


def extract_frames(vid_path: str, frame_path: str, file_name: str):
    ffmpeg = FFmpeg()
    save_path = os.path.join(frame_path, file_name+".jpeg")

    # This will create frame strip that will can use, frames are base on thumbnail model
    # ffmpeg -i output_010.mp4 -vf "thumbnail,tile=6x1" -frames:v 1 -qscale:v 1 THUMBNAIL.png
    # ! Try this, https://superuser.com/questions/1336285/use-ffmpeg-for-thumbnail-selections
    # ! https://ffmpeg.org/ffmpeg-all.html#thumbnail
    ffmpeg.option("i", vid_path)
    ffmpeg.option("vf", "thumbnail=65,tile=15x1")
    ffmpeg.option("frames:v", 1)
    ffmpeg.option("qscale:v", 1)
    ffmpeg.output(save_path)

    print(ffmpeg.arguments)
    ffmpeg.execute()

    # Croping out any black empty space within the frame strip
    img = Image.open(save_path)
    mask = img.getbbox()
    cropped = img.crop(mask)
    cropped.save(save_path)
