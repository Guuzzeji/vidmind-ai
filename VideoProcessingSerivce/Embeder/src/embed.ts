import { OpenAIEmbeddings } from "@langchain/openai";

const OPENAI_CALL_EMBED = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    // maxConcurrency: 5,
    modelName: 'text-embedding-3-large'
});


export async function embedText(text: string): Promise<number[]> {
    let res = await OPENAI_CALL_EMBED.embedQuery(text);
    return res;
}