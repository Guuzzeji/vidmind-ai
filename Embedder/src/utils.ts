import axios from 'axios';
import { encode } from 'gpt-tokenizer/cjs/model/gpt-4-32k-0314';

export async function getBase64(url: string): Promise<string> {
    return axios
        .get(url, {
            responseType: 'arraybuffer'
        })
        .then(response => Buffer.from(response.data, 'binary').toString('base64'));
}

export function secondsToTimestamp(convertSeconds: number): string {
    let dateObj = new Date(convertSeconds * 1000);
    let hours = dateObj.getUTCHours();
    let minutes = dateObj.getUTCMinutes();
    let seconds = dateObj.getSeconds();

    return hours.toString().padStart(2, '0')
        + ':' + minutes.toString().padStart(2, '0')
        + ':' + seconds.toString().padStart(2, '0');
}

export function trimTextByTokenSize(text: string, maxTokens: number): string {
    let editText = text;
    while (encode(editText).length >= maxTokens) {
        editText = editText.slice(0, -1);
    }

    return editText;
}