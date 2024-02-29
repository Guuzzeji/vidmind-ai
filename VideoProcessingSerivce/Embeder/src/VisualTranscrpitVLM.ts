// import { PromptTemplate } from "@langchain/core/prompts";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";

import { LLMSummarize } from './summarize.ts'

type VisualPromptParms = {
    audioTranscription: string,
    imgBase64: string,
    timeStart: string,
    timeEnd: string
}

const OPENAI_CALL = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4-vision-preview",
    temperature: 0.0,
    maxTokens: 4000,
    // maxConcurrency: 3,
    streaming: false,

});

const SYSTEM_PROMPT = `Your role is a Visual Media Content Analyst. Your task is to generate concise visual summaries from video screenshots. Start by establishing context using the video title, audio transcription, and any previous summaries available. Analyze the image sequence, focusing on key aspects like actions, charts, diagrams, and text. When images are unclear, make informed assumptions based on context. Craft a detailed summary, prioritizing text or code transcription and detailed descriptions of diagrams or charts. Exclude the video title and "Visual Summary:" in your response. Always provide a summary with the timestamp included at the start of your response (Example: "start timestamp" to "end timestamp" - "your response"). Keep your response short, between 3-5 sentences; if unable, state: 'None'.`;

export class VisualTranscrpitVLM {
    private title: string;
    private previousVisualInfomation = "None";

    constructor(title: string) {
        this.title = title;
    }

    async createVisualPrompt({ audioTranscription, imgBase64, timeStart, timeEnd }: VisualPromptParms): Promise<string> {
        let audioSummary = await LLMSummarize.invoke({ textToSummarize: audioTranscription })
        let previousVisualSummary = (this.previousVisualInfomation != "None") ? await LLMSummarize.invoke({ textToSummarize: this.previousVisualInfomation }) : "None"

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
                        "type": "text",
                        "text": `Previous Visual Summary: "${previousVisualSummary}"`
                    },
                    {
                        "type": "text",
                        "text": `Video Title: "${this.title}"`
                    },
                    {
                        "type": "text",
                        "text": `Audio Transcription: "${audioSummary}"`
                    },
                    {
                        "type": "text",
                        "text": `Audio Transcription: "${audioSummary}"`
                    },
                    {
                        "type": "text",
                        "text": `Video Timestamp: "${timeStart}" to "${timeEnd}"`
                    },
                    {
                        "type": "text",
                        "text": `Video Screenshot:`
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": "data:image/jpeg;base64," + imgBase64,
                            "detail": "low",
                        }
                    }
                ]
            })
        ];

        let res = await VisualTranscrpitVLM.callVLM(prompt);
        this.previousVisualInfomation = res

        return res;
    }

    private static async callVLM(prompt: AIMessage[]): Promise<string> {
        const LLM = OPENAI_CALL.pipe(new StringOutputParser());
        let respones = await LLM.invoke(prompt)
        return respones;
    }
}

