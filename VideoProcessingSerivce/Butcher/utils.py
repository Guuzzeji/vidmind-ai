import os
import shutil
import config


def create_work_folders(id_file: str) -> dict[str, str]:
    vid_path = os.path.join(config.CURRENT_PATH, config.WORKING_DIR, id_file)

    # Creating working folders to store clips and frames
    clips_path = os.path.join(vid_path, "clips")
    frame_path = os.path.join(vid_path, "frames")
    audio_path = os.path.join(vid_path, "audio")
    os.mkdir(clips_path)
    os.mkdir(frame_path)
    os.mkdir(audio_path)

    return {
        "clip_folder": clips_path,
        "vid_folder": vid_path,
        "frame_folder": frame_path,
        "audio_folder": audio_path
    }


def delete_work_folder(folder: str):
    if os.path.exists(folder):
        shutil.rmtree(folder)
