import { OpenAIEmbeddings } from "@langchain/openai";

const OPENAI_CALL_EMBED = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxConcurrency: 5
});

export async function embedTextList(rawTextList) {
    let emebedTexts = await OPENAI_CALL_EMBED.embedDocuments(rawTextList);
    let structuredEmbedWithText = [];

    for (let i = 0; i < emebedTexts.length; i++) {
        structuredEmbedWithText.push({
            text: rawTextList[i],
            embed: emebedTexts[i]
        });
    }

    return structuredEmbedWithText;
}

export async function searchEmbed(rawText) {
    let queryEmbed = await OPENAI_CALL_EMBED.embedQuery(rawText);

    return {
        queryEmbed: queryEmbed,
        text: rawText
    };
}