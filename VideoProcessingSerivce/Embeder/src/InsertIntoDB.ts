import pkg from 'pg';

const { Pool } = pkg;

const DB_POOL = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE_NAME,
    port: process.env.DB_PORT
});

export class InsertDataToDB {
    private dbClient: pkg.PoolClient;

    private constructor(dbClient: pkg.PoolClient) {
        this.dbClient = dbClient;
    }

    public static async initialize(): Promise<InsertDataToDB> {
        let client = await DB_POOL.connect()
        return new InsertDataToDB(client);
    }

    public async addVideoMetadata({ id, title, numOfClips }) {
        let sqlCall = "INSERT INTO video_metadata(id, title, numberOfClips) VALUES($1, $2, $3)";
        let values = [id, title, numOfClips];
        this.dbClient.query(sqlCall, values);
    }

    public async addAudioEmbed({ id, embedding, rawText, clipId, start, end }) {
        let sqlCall = "INSERT INTO audio_embeds(videoId, embedding, rawText, clipId, startTime, endTime) VALUES($1, $2, $3, $4, $5, $6)";
        let values = [id, `[${String(embedding)}]`, rawText, clipId, start, end];
        this.dbClient.query(sqlCall, values);
    }

    public async addVisualEmbed({ id, embedding, rawText, clipId, frameId, start, end }) {
        let sqlCall = "INSERT INTO frame_embeds(videoId, embedding, rawText, clipId, frameId, startTime, endTime) VALUES($1, $2, $3, $4, $5, $6, $7)";
        let values = [id, `[${String(embedding)}]`, rawText, clipId, frameId, start, end];
        this.dbClient.query(sqlCall, values);
    }

    public async addFileAudioUrl({ id, audioUrl, clipId }) {
        let sqlCall = "INSERT INTO s3_files_audio(videoId, s3AudioUrl, clipId) VALUES($1, $2, $3)";
        let values = [id, audioUrl, clipId];
        this.dbClient.query(sqlCall, values);
    }

    public async addFileImageUrl({ id, frameUrl, clipId, frameID }) {
        let sqlCall = "INSERT INTO S3_FILES(videoId, imgUrl, clipId, frameID) VALUES($1, $2, $3, $4)";
        let values = [id, frameUrl, clipId, frameID];
        this.dbClient.query(sqlCall, values);
    }

    public async commit() {
        await this.dbClient.query('COMMIT');
        await this.dbClient.release()
    }
}