import axios from 'axios';
import fs from 'fs';
import { resolve } from 'path';

export async function getBase64(url) {
    return axios
        .get(url, {
            responseType: 'arraybuffer'
        })
        .then(response => Buffer.from(response.data, 'binary').toString('base64'));
}

export function getPromptText(path) {
    const data = fs.readFileSync(resolve(path), 'utf8');
    return data;
}
