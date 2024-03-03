import { VisualTranscrpitVLM } from './VisualTranscrpitVLM.ts';
import { InsertDataToDB } from './InsertIntoDB.ts';
import { createTranscriptFromAudio } from './audioTranscript.ts';
import { embedText } from './embed.ts';

import { secondsToTimestamp } from './utils.ts';
import { getBase64, } from './utils.ts';

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

    private DBClient: InsertDataToDB;
    private VisualLLM: VisualTranscrpitVLM;

    private constructor({ title, clipChunks, id, DBClient }) {
        this.title = title;
        this.clipChunks = clipChunks
        this.id = id;
        this.DBClient = DBClient;
        this.VisualLLM = new VisualTranscrpitVLM(title)
    }

    static async initialize({ title, clipChunks, id }: WorkDetails) {
        let dbConnection = await InsertDataToDB.initialize();
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
            let audioFile = await getBase64(chunk.audioUrl);
            let audioText = await createTranscriptFromAudio(audioFile);
            audioText = `${secondsToTimestamp(chunk.startTime)} to ${secondsToTimestamp(chunk.endTime)}` + audioText;
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
            let visualText = await this.VisualLLM.createVisualPrompt({
                audioTranscription: audioText,
                imgs: chunk.frames
            });

            console.log(chunk.frames);
            let splitTimecodeInfo = visualText.split("\n");

            for (let j = 0; j < splitTimecodeInfo.length; j++) {
                let visualEmbed = await embedText(splitTimecodeInfo[j])
                console.log(visualText);
                this.visual.push({
                    clipId: chunk.id,
                    frameId: chunk.frames[j].id,
                    text: visualText,
                    embed: visualEmbed,
                    startTime: chunk.frames[j].start,
                    endTime: chunk.frames[j].end,
                    imgUrl: chunk.frames[j].imgUrl
                });
            }

        }
    }

    private async dbUpload() {
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
