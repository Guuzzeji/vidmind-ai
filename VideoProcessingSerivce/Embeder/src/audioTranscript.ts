import OpenAI, { toFile } from 'openai';
import { encode } from 'gpt-tokenizer';
import 'dotenv/config';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function createTranscriptFromAudio(fileBase64: string): Promise<string> {
    let transcription = await openai.audio.transcriptions.create({
        file: await toFile(Buffer.from(fileBase64, 'base64'), "audio.mp3", {
            type: "audio/mp3",
        }),
        model: "whisper-1",
        temperature: 0.0,
        response_format: 'text'
    });

    return transcription.text;
}

export function trimTextByTokenAmount(text: string, maxTokens: number): string {
    let editText = text;
    while (encode(editText).length >= maxTokens) {
        editText = editText.slice(0, -1);
    }

    return editText;
}