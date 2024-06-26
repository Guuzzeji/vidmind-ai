import { VisualTranscription } from '../LLM/VisualTranscription.ts';
import { DBClient } from '../db/DBClient.ts';
import { createAudioTranscript } from '../LLM/createAudioTranscript.ts';
import { embedText } from '../LLM/embedText.ts';

import { secondsToTimestamp, getBase64 } from '../utils.ts';
import * as log from 'npmlog';

type ClipChunk = {
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

type WorkDetails = {
    title: string,
    id: string,
    clipChunks: ClipChunk[]
}

type AudioEmbed = {
    id: number,
    text: string,
    embed: number[] | null,
    startTime: number,
    endTime: number,
    audioUrl: string
}

type VisualEmbed = {
    clipId: number,
    frameId: number,
    text: string,
    embed: number[] | null,
    startTime: number,
    endTime: number,
    imgUrl: string
}


export class Worker {
    private title: string;
    private clipChunks: ClipChunk[];
    private id: string;

    private audio: AudioEmbed[] = [];
    private visual: VisualEmbed[] = [];

    private DBClient: DBClient;
    private VisualLLM: VisualTranscription;

    private constructor({ title, clipChunks, id, DBClient }) {
        this.title = title;
        this.clipChunks = clipChunks
        this.id = id;
        this.DBClient = DBClient;
        this.VisualLLM = new VisualTranscription(title)
    }

    static async initialize({ title, clipChunks, id }: WorkDetails) {
        let dbConnection = await DBClient.initialize();
        return new Worker({ title, clipChunks, id, DBClient: dbConnection });
    }

    public async doJob() {
        await this.videoProcessing();
        await this.dbUpload();
    }

    private async videoProcessing() {
        // Adding and preprocess stuff for video
        for (let i = 0; i < this.clipChunks.length; i++) {
            let chunk = this.clipChunks[i];

            // Preprocessing audio
            log.info("[Video Processing] Audio - ", "URL:", chunk.audioUrl, "ChunkID:", chunk.id);
            let audioFile = await getBase64(chunk.audioUrl);
            let audioText = await createAudioTranscript(audioFile);
            audioText = `${secondsToTimestamp(chunk.startTime)} to ${secondsToTimestamp(chunk.endTime)} - ${audioText}`;
            let audioEmbed = await embedText(audioText)
            this.audio.push({
                id: i,
                text: audioText,
                embed: audioEmbed,
                startTime: chunk.startTime,
                endTime: chunk.endTime,
                audioUrl: chunk.audioUrl
            });

            // Creating visual
            log.info("[Video Processing] Visual - ", "URL:", JSON.stringify(chunk.frames), "ChunkID:", chunk.id);
            let visualText = await this.VisualLLM.createVisualPrompt({
                audioTranscription: audioText,
                imgs: chunk.frames
            });

            // console.log(chunk.frames);
            let splitTimecodeInfo = visualText.trim().replace(new RegExp("\n\n", 'g'), "**NEWLINE**").replace(new RegExp("\n", 'g'), "**NEWLINE**").trim().split("**NEWLINE**");
            // console.log(splitTimecodeInfo)

            for (let j = 0; j < splitTimecodeInfo.length; j++) {
                let visualEmbed = await embedText(splitTimecodeInfo[j])
                // console.log("DEBUG EMBED TEXT - ", j, splitTimecodeInfo[j]);
                this.visual.push({
                    clipId: chunk.id,
                    frameId: chunk.frames[j].id,
                    text: splitTimecodeInfo[j],
                    embed: visualEmbed,
                    startTime: chunk.frames[j].start,
                    endTime: chunk.frames[j].end,
                    imgUrl: chunk.frames[j].imgUrl
                });
            }

        }
    }

    private async dbUpload() {
        log.info("[Video Processing] Upload DB - ", "Video ID:", this.id);
        await this.DBClient.addVideoMetadata({ id: this.id, title: this.title, numOfClips: this.clipChunks.length });

        for (let x = 0; x < this.audio.length; x++) {
            let audioEmbedInfo = this.audio[x];

            await this.DBClient.addFileAudioUrl({
                id: this.id,
                audioUrl: audioEmbedInfo.audioUrl,
                clipId: audioEmbedInfo.id
            })

            await this.DBClient.addAudioEmbed({
                id: this.id,
                embedding: audioEmbedInfo.embed,
                rawText: audioEmbedInfo.text,
                clipId: audioEmbedInfo.id,
                start: audioEmbedInfo.startTime,
                end: audioEmbedInfo.endTime
            })
        }

        for (let x = 0; x < this.visual.length; x++) {
            let frameEmbed = this.visual[x];

            await this.DBClient.addFileImageUrl({
                id: this.id,
                frameUrl: frameEmbed.imgUrl,
                clipId: frameEmbed.clipId,
                frameId: frameEmbed.frameId
            })

            await this.DBClient.addVisualEmbed({
                id: this.id,
                frameId: frameEmbed.frameId,
                embedding: frameEmbed.embed,
                rawText: frameEmbed.text,
                clipId: frameEmbed.clipId,
                start: frameEmbed.startTime,
                end: frameEmbed.endTime
            })
        }

        await this.DBClient.commit()
    }

}
