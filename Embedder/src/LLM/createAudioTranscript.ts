import OpenAI, { toFile } from 'openai';
import 'dotenv/config';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEYs
});

export async function createAudioTranscript(fileBase64: string): Promise<string> {
    let transcription: any = await openai.audio.transcriptions.create({
        file: await toFile(Buffer.from(fileBase64, 'base64'), "audio.mp3", {
            type: "audio/mp3",
        }),
        model: "whisper-1",
        temperature: 0.0,
        response_format: 'text'
    });

    return transcription;
}

