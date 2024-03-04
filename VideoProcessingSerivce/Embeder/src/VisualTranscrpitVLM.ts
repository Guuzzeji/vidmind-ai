import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import 'dotenv/config'

import { LLMSummarize } from './summarize.ts'
import { getBase64, secondsToTimestamp } from "./utils.ts";

type Images = {
    start: number,
    end: number,
    imgUrl: string
}

type VLMPromptParms = {
    audioTranscription: string,
    imgs: Images[]
}


const OPENAI_CALL = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4-vision-preview",
    temperature: 0.3,
    maxTokens: 4000,
    // maxConcurrency: 3,
    streaming: false,

});

const SYSTEM_PROMPT = `As a Image-to-Text Conversion Specialist, your role is to provide detailed text summaries for each frame of the video. Begin by establishing context using the video title, audio transcription, and any additional text information provided to help you describe each image. Analyze each image, focusing on key elements such as actions, charts, diagrams, and text. If any image is unclear, use context from the audio transcript, other text information, and the any other images given to you to make informed assumptions. Craft a detailed summary for each frame, prioritizing the transcription of text or code and descriptions of diagrams or charts. 

Exclude the video title and "Visual Summary:" from your response. Always include the time code at the start of your response. Also make sure to start a newline for each image you are summarizing, Do not add extra spacing between image summary, Your response should look like this:

"start time code" to "end time code" - "your first response"
"start time code" to "end time code" - "your second response"
....
"start time code" to "end time code" - "your Nth response"

Keep your response concise. If unable to summarize a frame, state: 'None'.`;

export class VisualTranscrpitVLM {
    private title: string;

    constructor(title: string) {
        this.title = title;
    }

    async createVisualPrompt({ audioTranscription, imgs }: VLMPromptParms): Promise<string> {
        let audioSummary = await LLMSummarize.invoke({ textToSummarize: audioTranscription })
        let imagePrompt = await VisualTranscrpitVLM.createImagePromptList(imgs)

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
                        "text": `Video Title: "${this.title}"\n`
                    },
                    {
                        "type": "text",
                        "text": `Audio Transcription For All Images: "${audioSummary}"\n`
                    },
                    {
                        "type": "text",
                        "text": `Video Screenshots Below\n`
                    },
                    ...imagePrompt
                ],
            }),
        ];

        let res = await VisualTranscrpitVLM.callVLM(prompt);
        return res;
    }

    private static async createImagePromptList(imgs: Images[]): Promise<any[]> {
        let imgsLimit = imgs.slice(imgs.length > 10 ? -(10 - imgs.length) : 0) // limit to 10 images
        let result = []
        for (let img of imgsLimit) {
            let base64 = await getBase64(img.imgUrl)
            let titleMsg = {
                "type": "text",
                "text": `This image is from the time code "${secondsToTimestamp(img.start)}" to "${secondsToTimestamp(img.end)}"`
            }
            let imageMsg = {
                "type": "image_url",
                "image_url": {
                    "url": "data:image/jpeg;base64," + base64,
                    "detail": "high",
                }
            }
            result.push(titleMsg)
            result.push(imageMsg)
        }

        return result
    }

    private static async callVLM(prompt: AIMessage[]): Promise<string> {
        const LLM = OPENAI_CALL.pipe(new StringOutputParser());
        let respones = await LLM.invoke(prompt)
        return respones;
    }
}

