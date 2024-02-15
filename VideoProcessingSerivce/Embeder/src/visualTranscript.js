import { PromptTemplate } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

import { getPromptText } from "./utils.js";
import { trimTextByTokenAmount } from './audioTranscript.js';

const PATH_TO_PROMPT = "./src/prompts/visual_transcript_prompt.txt";
const VideoAnalysisPrompt = new PromptTemplate({
    inputVariables: ["audio_transcription", "title"],
    template: getPromptText(PATH_TO_PROMPT)
});

const OPENAI_CALL = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4-vision-preview",
    temperature: 0.05,
    maxTokens: 250,
    maxConcurrency: 3,
    streaming: false,
});

// TODO (LATER IDEA): Add chain base prompting, allow the new group of frames to have the context/descriptions  
//      of the perivous frame in the prompt to ensure that contiune context is kept with in the frames and ensures that context 
//      is always being keep
//      This may couse slow down in process frames, but hopeful with the boost in better quality frame descriptions
export async function createVisualPrompt(title, audio_transcription, img) {
    let trimText = trimTextByTokenAmount(audio_transcription, 325);

    let prompt = await VideoAnalysisPrompt.format({
        title: title,
        audio_transcription: trimText,
    });

    // for some reason you have to set prompt format like this for langchain to 
    // work right
    return [
        new HumanMessage({
            content: [
                { "type": "text", "text": prompt },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "data:image/jpeg;base64," + img,
                        "detail": "low",
                    }
                }
            ]
        })
    ];
}

export async function batchCallOpenAI(prompts) {
    let respones = await OPENAI_CALL.batch(prompts);

    let cleanTexts = [];
    for (let x = 0; x < respones.length; x++) {
        cleanTexts.push(respones[x].content);
    }

    return cleanTexts;
}
