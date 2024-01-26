import { ChatOpenAI } from "@langchain/openai";
import { DynamicStructuredTool, DynamicTool } from "@langchain/community/tools/dynamic";
import { HumanMessage } from "@langchain/core/messages";
// import { z } from "zod"; // May want to remove this
import axios from 'axios';

import { RefineImageSearchPrompt } from "../prompts/refineImageSearch.js";
import 'dotenv/config.js';

// Notes:
// - https://js.langchain.com/docs/modules/agents/tools/dynamic
// - https://js.langchain.com/docs/modules/agents/agent_types/react
// - https://api.js.langchain.com/classes/langchain_community_tools_dynamic.DynamicTool.html#schema

const CALL_OPENAI_API = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4-vision-preview",
    temperature: 0.0,
    maxTokens: 250,
    maxConcurrency: 1,
    streaming: false,
});


async function getVideoFrame(videoId, clipNumber) {
    let img = await axios.post("http://localhost:8080/API/frames-from-video", {
        "vid_id": videoId,
        "clip_num": clipNumber
    });

    return img.data;
}

// NOTE: Can of a hack, but for some reason cannot use Dynamic strucutre tool, even though GPT is able to create json
//      strucutre that should work with it, for some reason it keep stuck at "{" and causing errors
export const ClipSearchTool = new DynamicTool({
    name: "clipAnswerQuestion",
    description: `Using another AI that can analyize video clips, get an answer to a specific question regard a specific clip. 
    Input for this function is a single string with the following fields in this order: "question, clip_number, videoId" Each item should be separated by using this character "||". Do not use newline characters.`,
    func: async function (input) {
        console.log(input);
        const AI_INPUT = input.split("||");
        let question = AI_INPUT[0];
        // let visual_description = AI_INPUT[1];
        let clip_number = parseInt(AI_INPUT[1].trim());
        let videoId = AI_INPUT[2];

        let img = await getVideoFrame(videoId.trim(), clip_number);
        let promptTemplate = await RefineImageSearchPrompt.format({
            user_question: question,
            // visual_transcription: visual_description
        });

        let prompt = [];
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

        let response = await CALL_OPENAI_API.invoke(prompt);
        return String(response.content);
    }
});

// console.log(ClipSearchTool.toJSONNotImplemented());