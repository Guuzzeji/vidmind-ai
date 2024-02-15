import { insertVideoMetadata, insertS3Urls, insertVisualEmbed, insertAudioEmbed } from './db.js';

import { createTranscript, trimTextByTokenAmount } from './audioTranscript.js';
import { createVisualPrompt, batchCallOpenAI } from './visualTranscript.js';
import { embedTextList } from './embed.js';

import { getBase64 } from './utils.js';

export async function workerDoTask(redisPackage) {
    let visualPrompts = [];
    let audioTexts = [];

    await insertVideoMetadata({ id: redisPackage.id, title: redisPackage.title, numOfClips: redisPackage.chunks.length });

    // Adding and preprocess stuff for video
    for (let i = 0; i < redisPackage.chunks.length; i++) {
        let chunk = redisPackage.chunks[i];

        // Adding files to db
        await insertS3Urls({ id: redisPackage.id, clipId: chunk.id, audioUrl: chunk.audio_url, frameUrl: chunk.frame_url });

        // Preprocessing audio
        let audioFile = await getBase64(chunk.audio_url);
        let audioText = await createTranscript(audioFile);
        audioTexts.push(audioText);

        // Creating visual prompts
        let img = await getBase64(chunk.frame_url);
        let visualPrompt = await createVisualPrompt(redisPackage.title, trimTextByTokenAmount(audioText, 250), img);
        visualPrompts.push(visualPrompt);
    }

    // Having visual elements process by gpt and embed
    let resVisualPrompt = await batchCallOpenAI(visualPrompts);
    let audioEmbed = await embedTextList(audioTexts);
    let visualEmbed = await embedTextList(resVisualPrompt);

    // Adding embed to db
    for (let i = 0; i < redisPackage.chunks.length; i++) {
        let startTime = redisPackage.chunks[i].startTime;
        let endTime = redisPackage.chunks[i].endTime;

        await insertVisualEmbed({
            id: redisPackage.id,
            clipId: i,
            embedding: "[" + String(visualEmbed[i].embed) + "]",
            rawText: visualEmbed[i].text,
            start: startTime,
            end: endTime
        });

        await insertAudioEmbed({
            id: redisPackage.id,
            clipId: i,
            embedding: "[" + String(audioEmbed[i].embed) + "]",
            rawText: audioEmbed[i].text,
            start: startTime,
            end: endTime
        });
    }
}