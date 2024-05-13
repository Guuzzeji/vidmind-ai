import 'dotenv/config'

import { getBase64, secondsToTimestamp } from "../utils.ts";

type Image = {
    start: number,
    end: number,
    imgUrl: string
}

const AI_MODEL = "gpt-4o";
const MAX_TOKENS = 10000;
const SYSTEM_PROMPT = `As a Image-to-Text Conversion Specialist, your role is to provide detailed text summaries for each frame of the video. Begin by establishing context using the video title, audio transcription, and any additional text information provided to help you describe each image. Analyze each image, focusing on key elements such as actions, charts, diagrams, and text. If any image is unclear, use context from the audio transcript, other text information, and the any other images given to you to make informed assumptions. Craft a detailed summary for each frame, prioritizing the transcription of text or code and descriptions of diagrams or charts. 

Exclude the video title and "Visual Summary:" from your response. Always include the time code at the start of your response. Also make sure to start a newline for each image you are summarizing, Do not add extra spacing between image summary, Your response should look like this:

"start time code" to "end time code" - "your first response"

Keep your response concise. If unable to summarize a frame, state: 'None'.`;

export class VisualTranscriptPrompt {
    private title: string;

    constructor(title: string) {
        this.title = title;
    }

    public async createPrompt({ audioTranscription, img }: { audioTranscription: string, img: Image }): Promise<Object> {
        let imagePrompt = await VisualTranscriptPrompt.createImagePromptList(img)

        // for some reason you have to set prompt format like this for langchain to work
        let prompt = [
            { "role": "system", "content": SYSTEM_PROMPT },
            {
                "role": "user",
                "content": `Video Title: "${this.title}"\n`
            },
            {
                "role": "user",
                "content": `Audio Transcription For All Images: "${audioTranscription}"\n`
            },
            {
                "role": "user",
                "content": `Video Screenshots Below\n`
            },
            ...imagePrompt
        ];

        return prompt;
    }

    public createBatchPrompt({ audioTranscription, img, promptId }: { audioTranscription: string, img: Image, promptId: string }): any {
        let prompt = this.createPrompt({ audioTranscription, img })
        return {
            custom_id: promptId,
            method: "POST",
            url: "/v1/chat/completions",
            body: {
                model: AI_MODEL,
                messages: prompt
            },
            max_tokens: MAX_TOKENS
        }
    }

    private static async createImagePromptList(img: Image): Promise<any[]> {
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

        return [titleMsg, imageMsg];
    }
}

