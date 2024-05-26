import pkg from 'pg';
import 'dotenv/config'
import * as log from 'npmlog';

const { Pool } = pkg;

type VideoMetadataSQLParms = {
    id: string,
    title: string,
    numOfClips: number
}

type AudioEmbedSQLParms = {
    id: string,
    embedding: number[],
    rawText: string,
    clipId: number,
    start: number,
    end: number
}

type VisualsEmbedSQLParms = {
    id: string,
    embedding: number[],
    rawText: string,
    clipId: number,
    frameId: number,
    start: number,
    end: number
}

type FileAudioSQLParms = {
    id: string,
    audioUrl: string,
    clipId: number,
}

type FileImageSQLParms = {
    id: string,
    frameUrl: string,
    clipId: number,
    frameId: number,
}

const DB_POOL = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE_NAME,
    port: process.env.DB_PORT
});

export class DBClient {
    private dbClient: pkg.PoolClient;

    private constructor(dbClient: pkg.PoolClient) {
        this.dbClient = dbClient;
    }

    public static async initialize(): Promise<DBClient> {
        let client = await DB_POOL.connect()
        return new DBClient(client);
    }

    public async addVideoMetadata({ id, title, numOfClips }: VideoMetadataSQLParms) {
        log.info("[DB] INSERT Video Metadata - ", "Video ID:", id, "title:", title, "numOfClips:", numOfClips)
        let sqlCall = "INSERT INTO video_metadata(id, title, numberOfClips) VALUES($1, $2, $3)";
        let values = [id, title, numOfClips];
        this.dbClient.query(sqlCall, values);
    }

    public async addAudioEmbed({ id, embedding, rawText, clipId, start, end }: AudioEmbedSQLParms) {
        log.info("[DB] Audio Embed - ", "Video ID:", id, "text:", rawText, "clipId:", clipId)
        let sqlCall = "INSERT INTO audio_embeds(videoId, embedding, rawText, clipId, startTime, endTime) VALUES($1, $2, $3, $4, $5, $6)";
        let values = [id, `[${String(embedding)}]`, rawText, clipId, start, end];
        this.dbClient.query(sqlCall, values);
    }

    public async addVisualEmbed({ id, embedding, rawText, clipId, frameId, start, end }: VisualsEmbedSQLParms) {
        log.info("[DB] Audio Embed - ", "Video ID:", id, "text:", rawText, "clipId:", clipId, "frameId:", frameId)
        let sqlCall = "INSERT INTO frame_embeds(videoId, embedding, rawText, clipId, frameId, startTime, endTime) VALUES($1, $2, $3, $4, $5, $6, $7)";
        let values = [id, `[${String(embedding)}]`, rawText, clipId, frameId, start, end];
        this.dbClient.query(sqlCall, values);
    }

    public async addFileAudioUrl({ id, audioUrl, clipId }: FileAudioSQLParms) {
        log.info("[DB] Audio URLs - ", "Video ID:", id, "fileUrl:", audioUrl, "clipId:", clipId)
        let sqlCall = "INSERT INTO s3_files_audio(videoId, s3AudioUrl, clipId) VALUES($1, $2, $3)";
        let values = [id, audioUrl, clipId];
        this.dbClient.query(sqlCall, values);
    }

    public async addFileImageUrl({ id, frameUrl, clipId, frameId }: FileImageSQLParms) {
        log.info("[DB] Frame URLs - ", "Video ID:", id, "fileUrl:", frameUrl, "clipId:", clipId)
        let sqlCall = "INSERT INTO s3_files_frame(videoId, imgUrl, clipId, frameId) VALUES($1, $2, $3, $4)";
        let values = [id, frameUrl, clipId, frameId];
        this.dbClient.query(sqlCall, values);
    }

    public async commit() {
        log.info("[DB] Commit to DB...")
        await this.dbClient.query('COMMIT');
        await this.dbClient.release()
    }
}