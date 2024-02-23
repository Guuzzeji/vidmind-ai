// import { PromptTemplate } from "@langchain/core/prompts";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";

import { LLMSummarize } from './summarize.ts'

type VisualPromptParms = {
    title: string,
    audioTranscription: string,
    previousVisualInfomation: string,
    imgBase64: string
}

const OPENAI_CALL = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4-vision-preview",
    temperature: 0.05,
    // maxTokens: 250,
    // maxConcurrency: 3,
    streaming: false,
});

const SYSTEM_PROMPT = `As a Visual Media Content Analyst, your task is to generate concise visual summaries from video screenshots. Start by establishing context using the video title, audio transcription, and any previous summaries available. Analyze the image sequence, focusing on key aspects like actions, charts, digrams, and text. When images are unclear, make informed assumptions base on context. Craft a detailed summary, prioritizing text or code transcription and detailed descriptions of diagrams or charts. Exclude the video title in your response. Always provide a summary; if unable, state: 'None'.`;

// TODO (LATER IDEA): Add chain base prompting, allow the new group of frames to have the context/descriptions  
//      of the perivous frame in the prompt to ensure that contiune context is kept with in the frames and ensures that context 
//      is always being keep
//      This may couse slow down in process frames, but hopeful with the boost in better quality frame descriptions
export async function createVisualPrompt({ title, audioTranscription, previousVisualInfomation, imgBase64 }: VisualPromptParms): Promise<(SystemMessage | HumanMessage)[]> {
    let audioSummary = await LLMSummarize.invoke({ textToSummarize: audioTranscription })
    let previousVisualSummary = (previousVisualInfomation != "None") ? await LLMSummarize.invoke({ textToSummarize: previousVisualInfomation }) : "None"

    // for some reason you have to set prompt format like this for langchain to work
    return [
        new SystemMessage({
            content: [
                { "type": "text", "text": SYSTEM_PROMPT }
            ]
        }),
        new HumanMessage({
            content: [
                {
                    "type": "text",
                    "text": `Previous Visual Summary: "${previousVisualSummary}"`
                },
                {
                    "type": "text",
                    "text": `Video Title: "${title}"`
                },
                {
                    "type": "text",
                    "text": `Audio Transcription: "${audioSummary}"`
                },
                {
                    "type": "text",
                    "text": `Video Screenshot:`
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "data:image/jpeg;base64," + imgBase64,
                        "detail": "high",
                    }
                }
            ]
        })
    ];
}

export async function batchCallOpenAI(prompt: AIMessage[]): Promise<string> {
    let LLM = OPENAI_CALL.pipe(new StringOutputParser());
    let respones = await LLM.invoke(prompt)
    return respones;
}
