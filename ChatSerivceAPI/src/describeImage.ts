import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import 'dotenv/config'

const OPENAI_CALL = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4-vision-preview",
    temperature: 0.3,
    maxTokens: 4000,
    // maxConcurrency: 3,
    streaming: false,

});

const SYSTEM_PROMPT = `Describe the provided image in detail, capturing all aspects clearly.

Instructions:

1. Study the image closely, noting objects, colors, shapes, and textures.
2. Craft a comprehensive description, ensuring to cover all visible details.
3. Include context if necessary, but stick to observable facts.
4. Summarize the image effectively, providing a vivid mental picture.`;

async function callVLM(prompt: AIMessage[]): Promise<string> {
    const LLM = OPENAI_CALL.pipe(new StringOutputParser());
    let respones = await LLM.invoke(prompt)
    return respones;
}

export async function describeImage(imgBase64: string): Promise<string> {
    // for some reason you have to set prompt format like this for langchain to work
    let prompt = [
        new SystemMessage({
            content: [
                { "type": "text", "text": SYSTEM_PROMPT }
            ]
        }),
        new HumanMessage({
            content: [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "data:image/jpeg;base64," + imgBase64,
                        "detail": "high",
                    }
                }
            ],
        }),
    ];

    let res = await callVLM(prompt);
    return res;
}