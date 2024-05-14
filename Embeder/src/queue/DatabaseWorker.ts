import * as log from 'npmlog';

import { embedText } from '../LLM/embed.ts';
import { InsertDataToDB } from '../db/InsertIntoDB.ts';

type FrameEmbed = {
    clipId: number,
    frameId: number,
    text: string,
    embed: number[],
    startTime: number,
    endTime: number,
    imgUrl: string
}

type AudioEmbed = {
    id: number,
    text: string,
    embed?: number[],
    startTime: number,
    endTime: number,
    audioUrl: string
}

// TODO: Break down uploads to be embed uploads and file uploads for each part of the video 
// TODO: Do job emebeding loop for all text, Note should modify embed script to be a embed batch job as well
// TODO: Connect to Queue system

export class DatabaseWorker {
    private id: string;
    private title: string;

    private DBClient: InsertDataToDB;

    private videoChunks: VideoChunk[];

    private audio: AudioEmbed[];
    private frames: FrameEmbed[];

    private constructor({ title, audio, frames, videoChunks, id, DBClient }) {
        this.title = title;
        this.frames = frames;
        this.audio = audio;
        this.id = id;
        this.DBClient = DBClient;
    }

    static async initialize({ title, audio, frames, videoChunks, id }) {
        let dbConnection = await InsertDataToDB.initialize();
        return new DatabaseWorker({ title, audio, frames, videoChunks, id, DBClient: dbConnection });
    }

    public async doJob() {
        await this.uploadMetaData();
        await this.uploadAudio();
        await this.uploadFrames();
    }

    private async embedAudio() {
        for (let i = 0; i < this.videoChunks.length; i++) {

        }
    }

    private async embedFrames() {

    }

    private async uploadMetaData() {
        log.info("[Video Processing] Upload DB Meta Data - ", "Video ID:", this.id);
        await this.DBClient.addVideoMetadata({ id: this.id, title: this.title, numOfClips: this.videoChunks.length });
        await this.DBClient.commit()
    }

    private async uploadAudio() {
        log.info("[Video Processing] Upload DB Audio Data - ", "Video ID:", this.id);
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

        await this.DBClient.commit()
    }

    private async uploadFrames() {
        log.info("[Video Processing] Upload DB Frame Data - ", "Video ID:", this.id);
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
