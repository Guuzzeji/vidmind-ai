import OpenAI from 'openai';
import fs from 'fs';
import 'dotenv/config';
import { encode } from 'gpt-tokenizer';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function createTranscript(file) {
    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(file),
        model: "whisper-1",
        response_format: 'verbose_json'
    });

    //console.log(transcription);

    let cleanTranscription = [];
    for (let x = 0; x < transcription.segments.length; x++) {
        cleanTranscription.push({
            id: transcription.segments[x].id,
            start: transcription.segments[x].start,
            end: transcription.segments[x].end,
            text: transcription.segments[x].text
        });
    }

    return cleanTranscription;
}

export function findTranscriptionWithBounds(transcription, start, end) {
    let startIndex = searchByBound(transcription, start, "start", 0, transcription.length - 1);
    let endIndex = searchByBound(transcription, end, "end", startIndex, transcription.length - 1);

    // console.log(startIndex, endIndex);

    let boundScripts = transcription.slice(startIndex, startIndex + endIndex);
    let textScript = "";

    if (boundScripts.length == 0) {
        return "None";
    }

    for (let x = 0; x < boundScripts.length; x++) {
        textScript += boundScripts[x].text + " ";
    }

    return textScript.trim();
}

function searchByBound(transcription, time, timeBound, low, high) {
    let middle = 0;
    while (low <= high) {
        middle = Math.floor(low + (high - low) / 2);

        //console.log(middle);

        if (transcription[middle][timeBound] == time) {
            return middle;
        }

        if (transcription[middle][timeBound] < time) {
            low = middle + 1;
        } else {
            high = middle - 1;
        }
    }

    return middle;
}

export function trimTextByTokenAmount(text, maxTokens) {
    let editText = text;
    while (encode(editText).length >= maxTokens) {
        editText = editText.slice(0, -1);
        //console.log(encode(editText));
    }

    return editText;
}