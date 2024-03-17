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

export async function searchForVideos(): Promise<{ id: string, title: string }[]> {
    let client = await POOL.connect();
    let sqlQueryVideoSearch = `SELECT id, title FROM video_metadata LIMIT 15`
    let res = await client.query(sqlQueryVideoSearch);
    client.release();

    if (res.rows.length == 0) {
        throw new Error("Nothing Found")
    }

    return res.rows;
}