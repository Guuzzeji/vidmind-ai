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
    rawtext: string,
    clipid: number,
    starttime: number,
    endtime: number
}

export type Cite = {
    clipID: number,
    starttime: number,
    endtime: number,
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

export async function searchDBEmbeddings({ videoID, query }: SearchDBParms): Promise<{ videoID: string, Frames: DBEmbedResult[], Audios: DBEmbedResult[] }> {
    let embedQuery = await createEmbedQuery(query);
    let client = await POOL.connect();
    let sqlQueryFrames = `SELECT clipId, rawText, startTime, endTime FROM FRAME_EMBED WHERE id = '${videoID}' ORDER BY embedding <-> '[${embedQuery.queryEmbed.toString()}]'  LIMIT 10`
    let sqlQueryAudio = `SELECT clipId, rawText, startTime, endTime FROM AUDIO_EMBED WHERE id = '${videoID}' ORDER BY embedding <-> '[${embedQuery.queryEmbed.toString()}]' LIMIT 10`
    let resFrames = await client.query(sqlQueryFrames);
    let resAudio = await client.query(sqlQueryAudio);
    await client.query('COMMIT');

    client.release();

    // console.log(resFrames, resAudio);

    return {
        videoID: videoID,
        Frames: resFrames.rows,
        Audios: resAudio.rows
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

export function createCitionList(embeds: DBEmbedResult[]): Cite[] {
    let result = [];
    for (let i = 0; i < embeds.length; i++) {
        result.push({
            clipID: embeds[i].clipid,
            starttime: embeds[i].starttime,
            endtime: embeds[i].endtime
        })
    }

    return [... new Set(result)];
}



