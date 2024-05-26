import pkg from 'pg';
import 'dotenv/config'

const { Pool } = pkg;
export const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE_NAME,
    port: process.env.DB_PORT
});