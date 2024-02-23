import axios from 'axios';

export async function getBase64(url: string): Promise<string> {
    return axios
        .get(url, {
            responseType: 'arraybuffer'
        })
        .then(response => Buffer.from(response.data, 'binary').toString('base64'));
}