import { OpenAIEmbeddings } from "@langchain/openai";

const embedingModel = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxConcurrency: 5
});

export async function embedTextList(rawTextList) {
    let emebedTexts = await embedingModel.embedDocuments(rawTextList);
    let structuredEmbedWithText = [];

    for (let i = 0; i < emebedText.length; i++) {
        structuredEmbedWithText.push({
            text: rawTextList[i],
            embed: emebedTexts[i]
        });
    }

    return structuredEmbedWithText;
}

export async function searchEmbed(rawText) {
    let queryEmbed = await embeddings.embedQuery(rawText);

    return {
        queryEmbed: queryEmbed,
        text: rawText
    };
}