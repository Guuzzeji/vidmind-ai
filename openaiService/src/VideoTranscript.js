import { HumanMessage } from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";
import cosineSimilarity from "compute-cosine-similarity";
import 'dotenv/config';
import axios from 'axios';

import { VideoAnalysisPrompt } from './prompts/videoAnalyze.js';
import { createTranscript, findTranscriptionWithBounds, trimTextByTokenAmount } from './audioTranscript.js';
import { embedTextList, searchEmbed } from './embed.js';

// ! iMPORTANT this is only for MVP, should remove this and rewrite for better batching with OpenAI
// Batching this with OpenAI will allow for better scale use
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
    videoId;

    rawAudioTranscript;
    segmentAudioTranscript = [];
    visualTranscript = [];

    embedAudioTranscript = [];
    embedVisualTranscript = [];

    // Private
    #framePrompts = [];

    constructor(videoId) {
        this.videoId = videoId;
    }

    // ! Processing video
    async initialize() {
        this.videoInfo = await this.#getVideoInfomation();
        this.rawAudioTranscript = await createTranscript(this.videoInfo.vid_paths.audio);
        this.#chunkAudioTranscript();
        await this.#createPrompts();
        await this.#gptProcessVideo();
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
        for (let x = 0; x < this.videoInfo.clips.length; x++) {
            this.segmentAudioTranscript.push({
                text: findTranscriptionWithBounds(
                    this.rawAudioTranscript,
                    this.videoInfo.clips[x].start,
                    this.videoInfo.clips[x].end),
                start: this.videoInfo.clips[x].start,
                end: this.videoInfo.clips[x].start,
            });
        }
    }

    async #createPrompts() {
        // Looping over all clips to create prompts for each clip
        for (let x = 0; x < this.videoInfo.clips.length; x++) {
            let trimText = trimTextByTokenAmount(this.segmentAudioTranscript[x].text, 325);

            let prompt = await VideoAnalysisPrompt.format({
                title: this.videoInfo.title,
                audio_transcription: trimText,
            });

            // console.log(prompt);
            // console.log(encode(prompt).length + 85);

            let img = await this.#getVideoFrame(x);

            // for some reason you have to set prompt format like this for langchain to 
            // work right
            this.#framePrompts.push([
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
    }

    async #gptProcessVideo() {
        let respones = await OPENAI_CALL.batch(this.#framePrompts);

        for (let x = 0; x < respones.length; x++) {
            this.visualTranscript.push({
                start: this.videoInfo.clips[x].start,
                end: this.videoInfo.clips[x].end,
                text: respones[x].content
            });
        }
    };

    // ! Embeding stuff
    async createEmbedVisualTranscript() {
        let transcript = this.#createTextArray(this.visualTranscript);
        this.embedVisualTranscript = await embedTextList(transcript);
    }

    async createEmbedAudioTranscript() {
        let transcript = this.#createTextArray(this.segmentAudioTranscript);
        this.embedAudioTranscript = await embedTextList(transcript);
    }

    async searchAudioTranscript(searchTerm) {
        let searchQuery = await searchEmbed(searchTerm);
        return this.#findSimilarText(searchQuery, this.embedAudioTranscript);
    }

    async searchVisualTranscript(searchTerm) {
        let searchQuery = await searchEmbed(searchTerm);
        return this.#findSimilarText(searchQuery, this.embedVisualTranscript);
    }

    // Note: should probably write this as a sorting alghoritm then finding best match
    #findSimilarText(embedQuery, embedText) {
        let maxPercent = { content, similarity: 0, }; // Used to keep track of best embedding result

        for (let y = 0; y < embedText.length; y++) {
            let similarity = cosineSimilarity(embedText[y].embed, embedQuery.queryEmbed);

            if (maxPercent.similarity < similarity) {
                maxPercent.content = this.embedAudioTranscript[y];
                maxPercent.similarity = similarity;
            }
        }

        return maxPercent;
    }

    #createTextArray(transcript) {
        let transcript = [];
        for (let script of this.transcript) {
            transcript.push(script.text);
        }

        return transcript;
    }
}