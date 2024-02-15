import OpenAI, { toFile } from 'openai';
import { encode } from 'gpt-tokenizer';
import 'dotenv/config';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function createTranscript(fileBase64) {
    const transcription = await openai.audio.transcriptions.create({
        file: await toFile(Buffer.from(fileBase64, 'base64'), "audio.mp3", {
            contentType: "audio/mp3"
        }),
        model: "whisper-1",
        temperature: 0.2,
        response_format: 'text'
    });

    return transcription;
}

export function trimTextByTokenAmount(text, maxTokens) {
    let editText = text;
    while (encode(editText).length >= maxTokens) {
        editText = editText.slice(0, -1);
    }

    return editText;
}