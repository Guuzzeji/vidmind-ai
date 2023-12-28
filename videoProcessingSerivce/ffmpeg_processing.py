import os
import base64
from scenedetect import AdaptiveDetector, open_video, SceneManager, save_images


def create_clips(vid_path: str, clips_path: str) -> (list, bool):
    video = open_video(vid_path)
    scene_manager = SceneManager()
    scene_manager.add_detector(AdaptiveDetector(
        adaptive_threshold=4.5, min_scene_len=60))
    # scene_manager.add_detector(AdaptiveDetector())
    scene_manager.detect_scenes(video)
    scenes = scene_manager.get_scene_list()

    save_images(scenes, video, num_images=10,
                image_name_template='$SCENE_NUMBER-$IMAGE_NUMBER',
                output_dir=clips_path, encoder_param=75)

    return scenes


def frames_to_base64_list(path: str, wanted_scene: int) -> list[str]:
    folder = os.listdir(path)
    base64_file_list = []

    for file in folder:
        file_name = file.split("-")

        if int(file_name[0]) == wanted_scene:
            file_path = os.path.join(path, file)

            with open(file_path, "rb") as image_file:
                data = base64.b64encode(image_file.read())

            base64_file_list.append(data)

    return base64_file_list
