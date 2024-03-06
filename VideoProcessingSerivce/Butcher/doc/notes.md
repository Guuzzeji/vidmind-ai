# This will create frame strip that will can use, frames are base on thumbnail model
# ffmpeg -i output_010.mp4 -vf "thumbnail,tile=6x1" -frames:v 1 -qscale:v 1 THUMBNAIL.png
# ! Try this, https://superuser.com/questions/1336285/use-ffmpeg-for-thumbnail-selections
# ! https://ffmpeg.org/ffmpeg-all.html#thumbnail
# ! New Idea from https://blog.gdeltproject.org/using-ffmpegs-scene-detection-to-generate-a-visual-shot-summary-of-television-news/
# * IMPORTANT: Image limit of gpt is ~45 images on low, so seting to 25 images and increase step count may be the best bet, from: https://community.openai.com/t/gpt-4-vision-maximum-amount-of-images/573110
# * https://www.reddit.com/r/ffmpeg/comments/mye9h1/timestamp_from_metadata_on_image_timelapse/
# https://stackoverflow.com/questions/22531444/how-to-get-the-timestamp-of-the-image-extracted-using-ffmpeg
# https://superuser.com/questions/841872/how-do-i-extract-the-timestamps-associated-with-frames-ffmpeg-extracts-from-a-vi
# https://superuser.com/questions/1707609/ffmpeg-extract-several-individual-frames-from-a-video-given-a-list-of-timestamp
# https://video.stackexchange.com/questions/28287/how-to-add-timestamp-of-n-mins-between-photos-on-a-video-combined-from-photos

# Croping out any black empty space within the frame strip
# Create video image group chopper that we can use to group file into folder and upload to s3
# Fuck price, if it 2.55 then GOOD, use openai low res, just array the images into one prompt

https://python-ffmpeg.readthedocs.io/en/latest/api/#ffmpeg.asyncio

https://www.youtube.com/watch?v=N5vscPTWKOk

https://superuser.com/questions/669716/how-to-extract-all-key-frames-from-a-video-clip

https://superuser.com/questions/391257/extracting-one-of-every-10-frames-in-a-video-using-vlc-or-ffmpeg

https://www.scenedetect.com/docs/latest/api/detectors.html#module-scenedetect.detectors.threshold_detector

https://multimodal-vid.github.io/

https://www.geeksforgeeks.org/create-a-directory-in-python/

https://pytube.io/en/latest/api.html#youtube-object

https://stackoverflow.com/questions/72100457/use-bytesio-into-python-ffmpeg-or-other

https://www.scenedetect.com/docs/0.6.1/api/backends.html

https://stackoverflow.com/questions/46624449/load-bytesio-image-with-opencv

# Video refining and storage
- https://medium.com/@vaibhav0109/should-i-use-db-to-store-file-410ee22268c7
- https://stackoverflow.com/questions/23195522/opencv-fastest-method-to-check-if-two-images-are-100-same-or-not
- https://min.io/download#/docker
- https://github.com/drakkan/sftpgo
- https://www.npmjs.com/package/ssh2-sftp-client