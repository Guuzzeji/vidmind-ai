from scenedetect import open_video, SceneManager, ContentDetector, save_images
from ffmpeg import FFmpeg
from PIL import Image
import os
import shutil
from pathlib import Path

import config_env

from src.video.ffprobe import ffprobe

import logging
logging.basicConfig(format='%(asctime)s - %(message)s',
                    datefmt='%d-%b-%y %H:%M:%S')
logging.getLogger().setLevel(logging.DEBUG)


class ContentExtractor:
    timestamps = []

    def __init__(self, vid_path: str, id_file: str):
        self.id = id_file
        self.vid_path = vid_path
        self.folder_location = self.__create_work_folders(id_file)

    #! == PRIVATE ==

    def __create_work_folders(self, id_file: str) -> dict[str, str]:
        vid_path = os.path.join(config_env.CURRENT_PATH,
                                config_env.WORKING_DIR, id_file)

        # Creating working folders to store clips and frames
        clips_path = os.path.join(vid_path, "clips")
        frame_path = os.path.join(vid_path, "frames")
        audio_path = os.path.join(vid_path, "audio")
        Path(clips_path).mkdir(parents=True, exist_ok=True)
        Path(frame_path).mkdir(parents=True, exist_ok=True)
        Path(audio_path).mkdir(parents=True, exist_ok=True)

        return {
            "clip_folder": clips_path,
            "work_folder": vid_path,
            "frame_folder": frame_path,
            "audio_folder": audio_path,
        }

    def __create_clips(self):
        ffmpeg = FFmpeg()
        save_path = os.path.join(
            self.folder_location["clip_folder"], "%03d.mp4")

        # Getting time segment base on %4 rule, chunk video by a percentage (0.04)
        # This will give us 50 chunks to use when processing with GPT
        video_info = ffprobe(self.vid_path)
        seg_time = float(video_info.json.get("streams")
                         [0].get("duration")) * 0.022

        # ffmpeg -i input.mp4 -map 0 -c copy -f segment -segment_time 1800 -reset_timestamps 1 output_%03d.mp4
        ffmpeg.option("i", self.vid_path)
        ffmpeg.option("map", 0)
        ffmpeg.option("c", "copy")
        ffmpeg.option("f", "segment")
        ffmpeg.option("segment_time", seg_time)
        ffmpeg.option("reset_timestamps", 1)
        ffmpeg.output(save_path)

        ffmpeg.execute()

        self.timestamps = self.__create_segment_time_list(
            self.folder_location["clip_folder"])

    def __create_segment_time_list(self, clips_path: str) -> list[dict[str, float]]:
        folder = os.listdir(clips_path)
        folder.sort()  # Fix issue with list being not sorted correctly

        seg_list = []

        for file in folder:
            video_path = os.path.join(clips_path, file)
            file_id = int(file.removesuffix(".mp4"))

            # Getting video info
            video_info = ffprobe(video_path).json.get("streams")[0]

            if len(seg_list) == 0:
                time_segment = {
                    "id": file_id,
                    "start": 0,
                    "end": float(video_info.get("duration")),
                    "clip_vid_path": video_path
                }
                seg_list.append(time_segment)
            else:
                prev_time = seg_list[len(seg_list) - 1].get("end")
                time_segment = {
                    "id": file_id,
                    "start": prev_time,
                    "end": prev_time + float(video_info.get("duration")),
                    "clip_vid_path": video_path
                }
                seg_list.append(time_segment)

        return seg_list

    def __extract_audio(self, clip_vid_path: str, folder_path: str, file_name: str):
        ffmpeg = FFmpeg()
        save_path = os.path.join(folder_path, file_name+".mp3")

        # https://superuser.com/questions/332347/how-can-i-convert-mp4-video-to-mp3-audio-with-ffmpeg
        ffmpeg.option("i", clip_vid_path)
        ffmpeg.option("map", "a")
        ffmpeg.option("q:a", "0")
        ffmpeg.option("y")
        ffmpeg.output(save_path)

        # print(ffmpeg.arguments)
        ffmpeg.execute()

    def __extract_frames(self, clip_vid_path: str, folder_path: str, clip_info: dict[str, any]):
        save_folder_path = os.path.join(
            self.folder_location["frame_folder"], folder_path)
        Path(save_folder_path).mkdir(parents=True, exist_ok=True)

        save_path = os.path.join(
            save_folder_path, "$SCENE_NUMBER")

        video = open_video(clip_vid_path)
        scene_manager = SceneManager()
        scene_manager.add_detector(
            ContentDetector(threshold=8.7, luma_only=True, min_scene_len=30*2))
        scene_manager.auto_downscale = True
        scene_manager.detect_scenes(video)
        scenes = scene_manager.get_scene_list()

        if len(scenes) == 0:
            ffmpeg_save_path = os.path.join(save_folder_path, "%03d.jpg")
            ffmpeg = FFmpeg()
            ffmpeg.option("i", clip_vid_path)
            ffmpeg.option("vf", "thumbnail=1000")
            ffmpeg.option("frames:v", 1)
            ffmpeg.option("qscale:v", 3)
            ffmpeg.output(ffmpeg_save_path)
            ffmpeg.execute()

        else:
            save_images(scenes, video, num_images=1,
                        image_name_template=save_path, encoder_param=85)

        img_list = os.listdir(save_folder_path)
        for img_path in img_list:
            full_path = os.path.join(save_folder_path, img_path)
            img = Image.open(full_path)
            img.thumbnail((1280, 720), Image.ANTIALIAS)
            mask = img.getbbox()
            cropped = img.crop(mask)
            cropped.save(full_path)

        img_timestamps = []
        if len(scenes) != 0:
            for i in range(0, len(scenes)):
                img_timestamps.append({
                    "id": i,
                    "start": clip_info["start"] + scenes[i][0].get_seconds(),
                    "end": clip_info["start"] + scenes[i][1].get_seconds()
                })

        else:
            img_timestamps.append({
                "id": 0,
                "start": clip_info["start"],
                "end": clip_info["end"],
            })

        clip_info["imgs_timestamps"] = img_timestamps

    #! == PUBLIC ==

    def get_content(self):
        logging.info("Creating Clips Video ID: " + self.id)
        self.__create_clips()

        # Taking thoses clips and breaking them down into frame strips
        logging.info("Processing each Audio Clips Video ID: " + self.id)
        for clip in self.timestamps:
            # print(clip)
            logging.info("Processing Audio Clips Video ID: "
                         + self.id
                         + " ClipId:" + str(clip["id"]))
            self.__extract_audio(
                clip["clip_vid_path"], self.folder_location["audio_folder"], str(clip["id"]))

        logging.info("Processing each Frame Clips Video ID: " + self.id)
        for clip in self.timestamps:
            logging.info("Processing Frame Clips Video ID: "
                         + self.id
                         + " ClipId:" + str(clip["id"]))
            self.__extract_frames(clip["clip_vid_path"], str(clip["id"]), clip)

    def delete_work_folder(self):
        if os.path.exists(self.folder_location["work_folder"]):
            shutil.rmtree(self.folder_location["work_folder"])
