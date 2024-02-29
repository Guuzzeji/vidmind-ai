import { VisualTranscrpitVLM } from './VisualTranscrpitVLM.ts';
import { InsertDataToDB } from './InsertIntoDB.ts';
import { createTranscriptFromAudio } from './audioTranscript.ts';
import { embedText } from './embed.ts';

import { secondsToTimestamp } from './utils.ts';
import { getBase64, } from './utils.ts';

type ClipChunk = {
    id: number,
    startTime: number,
    endTime: number
    audioUrl: string,
    frameUrl: string,
}

type WorkDetails = {
    title: string,
    id: string,
    clipChunks: ClipChunk[]
}

type IdText = {
    id: number,
    text: string,
    embed: number[] | null,
    startTime: number,
    endTime: number
}

export class Worker {
    private title: string;
    private clipChunks: ClipChunk[];
    private id: string;

    private audio: IdText[] = [];
    private visual: IdText[] = [];

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
                endTime: chunk.endTime
            });

            // Creating visual
            let img = await getBase64(chunk.frameUrl);
            let visualText = await this.VisualLLM.createVisualPrompt({
                audioTranscription: audioText,
                imgBase64: img,
                timeStart: secondsToTimestamp(chunk.startTime),
                timeEnd: secondsToTimestamp(chunk.endTime)
            });
            let visualEmbed = await embedText(visualText)
            console.log(visualText);
            this.visual.push({
                id: i,
                text: visualText,
                embed: visualEmbed,
                startTime: chunk.startTime,
                endTime: chunk.endTime
            });
        }
    }

    private async dbUpload() {
        await this.DBClient.addVideoMetadata({ id: this.id, title: this.title, numOfClips: this.clipChunks.length });

        for (let x = 0; x < this.clipChunks.length; x++) {
            let chunk = this.clipChunks[x];
            this.DBClient.addFileURL({ id: this.id, audioUrl: chunk.audioUrl, frameUrl: chunk.frameUrl, clipId: chunk.id })

            this.DBClient.addAudioEmbed({
                id: this.id,
                embedding: this.audio[x].embed,
                rawText: this.audio[x].text,
                clipId: this.audio[x].id,
                start: this.audio[x].startTime, end: this.audio[x].endTime
            })

            this.DBClient.addAudioEmbed({
                id: this.id,
                embedding: this.visual[x].embed,
                rawText: this.visual[x].text,
                clipId: this.visual[x].id,
                start: this.visual[x].startTime, end: this.visual[x].endTime
            })
        }

        await this.DBClient.commit()
    }

}
