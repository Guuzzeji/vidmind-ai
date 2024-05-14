import * as log from 'npmlog';

import { VisualTranscriptPrompt } from '../LLM/VisualTranscriptPrompt.ts';
import { createTranscriptFromAudio } from '../LLM/audioTranscript.ts';
import { createBatchJob } from './createBatchJob.ts';
import { OPENAI_BATCH_CHECKING_QUEUE } from './queue.ts'

import { secondsToTimestamp, getBase64 } from '../utils.ts';

type VideoChunk = {
    id: number,
    startTime: number,
    endTime: number,
    frames: {
        end: number,
        start: number,
        id: number,
        imgUrl: string
    }[],
    audioUrl: string,
}

type AudioChunk = {
    id: number,
    text: string,
    startTime: number,
    endTime: number,
    audioUrl: string
}

export class VideoWorker {
    private id: string;
    private title: string;

    private audio: AudioChunk[];
    private videoChunks: VideoChunk[];

    private batchJobDetails: any;

    private VisualLLM: VisualTranscriptPrompt;

    public constructor({ title, videoChunks, id }) {
        this.title = title;
        this.videoChunks = videoChunks
        this.id = id;
        this.VisualLLM = new VisualTranscriptPrompt(title)
    }

    public async doJob() {
        await this.audioProcessing();
        await this.frameProcessing();
        await this.addJobToQueue();
    }

    private async audioProcessing() {
        for (let i = 0; i < this.videoChunks.length; i++) {
            let chunk = this.videoChunks[i];

            // Preprocessing audio
            log.info("[Video Processing] Audio - ", "URL:", chunk.audioUrl, "ChunkID:", chunk.id);
            let audioFile = await getBase64(chunk.audioUrl);
            let audioText = await createTranscriptFromAudio(audioFile);

            audioText = `${secondsToTimestamp(chunk.startTime)} to ${secondsToTimestamp(chunk.endTime)} - ${audioText}`;

            this.audio.push({
                id: i,
                text: audioText,
                startTime: chunk.startTime,
                endTime: chunk.endTime,
                audioUrl: chunk.audioUrl
            });
        }
    }

    private async frameProcessing() {
        // Adding and preprocess stuff for video
        let promptsToBatch = ""

        for (let i = 0; i < this.videoChunks.length; i++) {
            let chunk = this.videoChunks[i];

            // Creating visual
            log.info("[Video Processing] Visual - ", "URL:", JSON.stringify(chunk.frames), "ChunkID:", chunk.id);

            for (let j = 0; j < chunk.frames.length; j++) {
                log.info("[Video Processing] Visual - ", "URL:", JSON.stringify(chunk.frames), "ChunkID:", chunk.id, "FrameID:", j);

                let batchPrompt = await this.VisualLLM.createBatchPrompt({
                    audioTranscription: this.audio[i].text,
                    img: chunk.frames[j],
                    promptId: `${i}-${j}`
                });

                promptsToBatch += batchPrompt.toString() + "\n";
            }
        }

        this.batchJobDetails = await createBatchJob(promptsToBatch, this.id)
    }

    private async addJobToQueue(): Promise<void> {
        OPENAI_BATCH_CHECKING_QUEUE.add({
            videoId: this.id,
            title: this.title,
            batchId: this.batchJobDetails.batchId,
            audio: this.audio,
            videoChunks: this.videoChunks
        })
    }
}
