import { HumanMessage } from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";
import 'dotenv/config';
import axios from 'axios';

import { VideoAnalysisPrompt } from './prompts/videoAnalyze.js';
import { createTranscript, findTranscriptionWithBounds, trimTextByTokenAmount } from './audioTranscript.js';
import { embedTextList } from './embed.js';

const OPENAI_CALL = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4-vision-preview",
    temperature: 0.05,
    maxTokens: 250,
    maxConcurrency: 3,
    streaming: false,
});

export class VideoTranscript {

    // Public
    videoInfo;

    rawAudioTranscript;
    chunkAudioTranscript;
    visualTranscript = [];

    embedAudioTranscript = [];
    embedVisualTranscript = [];

    // Private
    #framePrompts;

    constructor(videoId) {
        this.videoId = videoId;
    }

    async initialize() {
        videoInfo = await this.#getVideoInfomation(this.videoId);
        rawAudioTranscript = await createTranscript(videoInfo.vid_paths.audio);
        this.#chunkAudioTranscript();
        this.#createPrompts();
        this.#gptProcessVideo();
    }

    async #getVideoInfomation() {
        let videoFile = await axios.post("http://localhost:8080/API/process-yt-video", {
            "vid_id": this.videoId
        });

        let videoMetaData = await axios.post("http://localhost:8080/API/get-video-info", {
            "vid_id": this.videoId
        });

        return {
            ...videoFile.data,
            ...videoMetaData.data
        };
    }

    async #getVideoFrame(clipNumber) {
        let img = await axios.post("http://localhost:8080/API/frames-from-video", {
            "vid_id": this.videoId,
            "clip_num": clipNumber
        });

        return img.data;
    }

    #chunkAudioTranscript() {
        for (let x = 0; x < videoInfo.clips.length; x++) {
            chunkAudioTranscript.push(findTranscriptionWithBounds(
                audioTranscript,
                videoInfo.clips[x].start,
                videoInfo.clips[x].end));
        }
    }

    async #createPrompts() {
        let prompts = [];

        // Looping over all clips to create prompts for each clip
        for (let x = 0; x < videoInfo.clips.length; x++) {
            let trimText = trimTextByTokenAmount(chunkAudioTranscript[i], 325);

            let prompt = await VideoAnalysisPrompt.format({
                title: videoInfo.title,
                audio_transcription: trimText,
            });

            // console.log(prompt);
            // console.log(encode(prompt).length + 85);

            let img = await this.#getVideoFrame(videoId, x);

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
                })
            ]);
        }

        this.#framePrompts = prompts;
    }

    async #gptProcessVideo() {
        let respones = await OPENAI_CALL.batch(this.#framePrompts);
        for (let x = 0; x < respones.length; x++) {
            // console.log(messages.content + '\n');
            this.visualTranscript.push({
                start: this.videoId.clip[x].start,
                end: this.videoId.clip[x].end,
                text: messages.content
            });
        }
    };

    async embedVisualTranscript() {
        this.embedVisualTranscript = await embedTextList(visualTranscript);
    }

    async embedAudioTranscript() {
        this.embedAudioTranscript = await embedTextList(chunkAudioTranscript);
    }
}