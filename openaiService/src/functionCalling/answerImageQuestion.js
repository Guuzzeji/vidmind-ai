import { ChatOpenAI } from "langchain/chat_models/openai";
import { RefineImageSearchPrompt } from "../prompts/refineImageSearch.js";
import { getVideoFrame } from "../createVisualDescription.js";
import 'dotenv/config.js';

async function answerImageQuestion(question, visualDescription, clipNum, videoId) {
    let prompt = [];

    let img = await getVideoFrame(videoId, clipNum);
    let promptTemplate = await RefineImageSearchPrompt.format({
        user_question: question,
        visual_transcription: visualDescription
    });

    prompt.push(
        new HumanMessage({
            content: [
                { "type": "text", "text": promptTemplate },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "data:image/jpeg;base64," + img.frames,
                        "detail": "low",
                    }
                }
            ]
        })
    );

    const chat = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-4-vision-preview",
        temperature: 0.0,
        maxTokens: 250,
        maxConcurrency: 0,
        streaming: false,
    });

    let response = await chat.invoke(prompt);

    return response.content;
}