import { ChatOpenAI } from "langchain/chat_models/openai";
import { createPromptsForVideo } from "./src/createVisualDescription.js";
import 'dotenv/config';

// ! IMPORTANT FIX
// TODO: Create a token algorthiem that can sort sort the array of prompts and set of langchain to do the correct amount of prompt process

const TEST_VID_ID = "SmyPTnlqhlk";

let prompts = await createPromptsForVideo(TEST_VID_ID);

const chat = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4-vision-preview",
    temperature: 0.05,
    maxTokens: 250,
    maxConcurrency: 3,
    streaming: false,
});

let respones = await chat.batch(prompts);

for (let messages of respones) {
    console.log(messages.content + '\n');
}



