import 'dotenv/config'

import { pool } from './pool.ts'

export async function searchForVideos(): Promise<{ id: string, title: string }[]> {
    let client = await pool.connect();
    let sqlQueryVideoSearch = `SELECT id, title FROM video_metadata LIMIT 15`
    let res = await client.query(sqlQueryVideoSearch);
    client.release();

    return res.rows;
}