import axios from 'axios';

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