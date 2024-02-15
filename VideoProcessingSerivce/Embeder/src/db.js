import pkg from 'pg';

const { Pool } = pkg;

const POOL = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE_NAME,
    port: process.env.DB_PORT
});

// https://node-postgres.com/
// https://medium.com/@johannes.ocean/setting-up-a-postgres-database-with-the-pgvector-extension-10ab7ff212cc

export async function insertVideoMetadata({ id, title, numOfClips }) {
    let client = await POOL.connect();
    let sqlCall = "INSERT INTO METADATA(id, title, numberOfClips) VALUES($1, $2, $3)";
    let values = [id, title, numOfClips];

    let res = await client.query(sqlCall, values);
    // console.log(res);
    client.release();
}

export async function insertAudioEmbed({ id, embedding, rawText, clipId, start, end }) {
    let client = await POOL.connect();
    let sqlCall = "INSERT INTO AUDIO_EMBED(id, embedding, rawText, clipId, startTime, endTime) VALUES($1, $2, $3, $4, $5, $6)";
    let values = [id, embedding, rawText, clipId, start, end];

    let res = await client.query(sqlCall, values);
    // console.log(res);
    client.release();
}

export async function insertVisualEmbed({ id, embedding, rawText, clipId, start, end }) {
    let client = await POOL.connect();
    let sqlCall = "INSERT INTO FRAME_EMBED(id, embedding, rawText, clipId, startTime, endTime) VALUES($1, $2, $3, $4, $5, $6)";
    let values = [id, embedding, rawText, clipId, start, end];

    let res = await client.query(sqlCall, values);
    // console.log(res);
    client.release();
}

export async function insertS3Urls({ id, audioUrl, frameUrl, clipId }) {
    let client = await POOL.connect();
    let sqlCall = "INSERT INTO S3_FILES(id, s3AudioUrl, s3FramesUrl, clipId) VALUES($1, $2, $3, $4)";
    let values = [id, audioUrl, frameUrl, clipId];

    let res = await client.query(sqlCall, values);
    // console.log(res);
    client.release();
}
