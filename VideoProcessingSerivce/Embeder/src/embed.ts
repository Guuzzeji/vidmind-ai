import { OpenAIEmbeddings } from "@langchain/openai";

const OPENAI_CALL_EMBED = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxConcurrency: 5,
    modelName: 'text-embedding-3-large'
});

type Embeddings = {
    text: string,
    embedding: number[]
}

export async function embedTextList(rawTextList: string[]): Promise<Embeddings[]> {
    let emebedTexts = await OPENAI_CALL_EMBED.embedDocuments(rawTextList);
    let structuredEmbedWithText: Embeddings[] = [];

    for (let i = 0; i < emebedTexts.length; i++) {
        structuredEmbedWithText.push({
            text: rawTextList[i],
            embedding: emebedTexts[i]
        });
    }

    return structuredEmbedWithText;
}