import OpenAI from 'openai';

const OPENAI = new OpenAI();

export async function createBatchJob(batchFile: string, videoId: string): Promise<string> {
    let file = await OPENAI.files.create({
        file: new File([batchFile], `${videoId}.jsonl`),
        purpose: "batch"
    });

    console.log("File ->", file);

    const batch = await OPENAI.batches.create({
        input_file_id: file.id,
        endpoint: "/v1/chat/completions",
        completion_window: "24h"
    });

    console.log(batch)

    return batch.id;
}