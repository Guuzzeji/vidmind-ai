import { HumanMessage } from "langchain/schema";
import { VideoAnalysisPrompt } from './prompts/videoAnalyze.js';
import { createTranscript, findTranscriptionWithBounds, trimTextByTokenAmount } from './audioTranscript.js';
// import { encode } from 'gpt-tokenizer';
import 'dotenv/config';
import axios from 'axios';

async function getVideoInfomation(videoId) {
    let videoFile = await axios.post("http://localhost:8080/API/process-yt-video", {
        "vid_id": videoId
    });

    let videoMetaData = await axios.post("http://localhost:8080/API/get-video-info", {
        "vid_id": videoId
    });

    return {
        ...videoFile.data,
        ...videoMetaData.data
    };
}

async function getVideoFrame(videoId, clip_number) {
    let img = await axios.post("http://localhost:8080/API/frames-from-video", {
        "vid_id": videoId,
        "clip_num": clip_number
    }).data;

    return img;
}

export async function createPromptsForVideo(videoId) {
    let prompts = [];

    let videoInfo = getVideoInfomation(videoId);
    let audioTranscript = await createTranscript(videoInfo.vid_paths.audio);

    // Looping over all clips to create prompts for each clip
    for (let x = 0; x < videoInfo.clips.length; x++) {
        let text = findTranscriptionWithBounds(audioTranscript, videoInfo.clips[x].start, videoInfo.clips[x].end);
        text = trimTextByTokenAmount(text, 325);

        let prompt = await VideoAnalysisPrompt.format({
            title: videoInfo.title,
            audio_transcription: text,
        });

        // console.log(prompt);
        // console.log(encode(prompt).length + 85);

        let img = await getVideoFrame(videoId, x);

        // for some reason you have to set prompt format like this for langchain to 
        // work right
        prompts.push([
            new HumanMessage({
                content: [
                    { "type": "text", "text": prompt },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": "data:image/jpeg;base64," + img.frames,
                            "detail": "low",
                        }
                    }
                ]
            })]);
    }

    return prompts;
}