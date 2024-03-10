import { OpenAIEmbeddings } from "@langchain/openai";
import pkg from 'pg';
import 'dotenv/config'

const { Pool } = pkg;
const POOL = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE_NAME,
    port: process.env.DB_PORT
});

const OPENAI_CALL_EMBED = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxConcurrency: 5,
    modelName: "text-embedding-3-large"
});

export type OpenAIEmbedResult = {
    queryEmbed: number[],
    text: string
}

export type DBEmbedResult = {
    frameId: number | undefined,
    rawtext: string,
    clipid: number,
    starttime: number,
    endtime: number
}

export type DBEmbedImageResult = {
    frameId: number,
    imgurl: string
    clipid: number,
    starttime: number,
    endtime: number
}

export type SearchDBParms = {
    videoID: string,
    query: string
}

async function createEmbedQuery(text: string): Promise<OpenAIEmbedResult> {
    let queryEmbed = await OPENAI_CALL_EMBED.embedQuery(text);
    return {
        queryEmbed: queryEmbed,
        text: text
    };
}

export async function searchAudioEmbed({ videoID, query }: SearchDBParms): Promise<{ videoID: string, Audios: DBEmbedResult[] }> {
    let embedQuery = await createEmbedQuery(query);
    let client = await POOL.connect();
    let sqlQueryAudio = `SELECT clipId, rawText, startTime, endTime FROM audio_embeds WHERE videoId = '${videoID}' ORDER BY embedding <-> '[${embedQuery.queryEmbed.toString()}]' LIMIT 15`
    let resAudio = await client.query(sqlQueryAudio);
    client.release();

    if (resAudio.rows.length > 0) {
        throw new Error("Nothing Found")
    }

    return {
        videoID: videoID,
        Audios: resAudio.rows
    };
}

export async function searchVisualEmbed({ videoID, query }: SearchDBParms): Promise<{ videoID: string, Frames: DBEmbedResult[] }> {
    let embedQuery = await createEmbedQuery(query);
    let client = await POOL.connect();
    let sqlQueryFrames = `SELECT clipId, rawText, startTime, endTime, frameId FROM frame_embeds WHERE videoId = '${videoID}' ORDER BY embedding <-> '[${embedQuery.queryEmbed.toString()}]'  LIMIT 15`
    let resFrames = await client.query(sqlQueryFrames);
    client.release();

    if (resFrames.rows.length > 0) {
        throw new Error("Nothing Found")
    }

    return {
        videoID: videoID,
        Frames: resFrames.rows,
    };
}

export async function searchVisualEmbedForImages({ videoID, query }: SearchDBParms): Promise<{ videoID: string, Frames: DBEmbedImageResult[] }> {
    let embedQuery = await createEmbedQuery(query);
    let client = await POOL.connect();
    let sqlQueryFrames = `SELECT frame_embeds.clipId, imgurl, startTime, endTime, frame_embeds.frameId FROM frame_embeds, s3_files_frame WHERE frame_embeds.videoId = '${videoID}' AND s3_files_frame.clipId = frame_embeds.clipId AND s3_files_frame.frameId = frame_embeds.frameId  ORDER BY embedding <-> '[${embedQuery.queryEmbed.toString()}]' LIMIT 15`
    let resFrames = await client.query(sqlQueryFrames);
    client.release();

    if (resFrames.rows.length > 0) {
        throw new Error("Nothing Found")
    }

    return {
        videoID: videoID,
        Frames: resFrames.rows,
    };
}


export function convertDBEmbedResultToString(embeds: DBEmbedResult[]): string {
    let textResult = "";
    for (let i = 0; i < embeds.length; i++) {
        textResult += `- ${embeds[i].rawtext}\n`;
        textResult.trim()
    }

    return textResult;
}


