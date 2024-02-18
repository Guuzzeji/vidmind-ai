import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import 'dotenv/config'

const GPT = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo-0125",
    temperature: 0.0,
    // maxTokens: 250,
    maxConcurrency: 1,
    streaming: false,
});

const rewritePrompt = PromptTemplate.fromTemplate(
    `Given a user prompt intended for extracting information from a video, refine it to enhance clarity, specificity, and focus within the context of video content. Your task is to rewrite the user's existing prompt to better articulate the desired information or insights from the video. Ensure that the revised prompt maintains the original intent while providing clearer direction and removing ambiguity. Focus on improving coherence and relevance in the refined prompt to facilitate better understanding and extraction of relevant details from the video content.

Do not add "Refined Prompt:" to your respones, just give back the rewritten prompt that you have created.

User Prompt: "{userPrompt}"`
)

export const LLMRewritUserPrompt = rewritePrompt.pipe(GPT).pipe(new StringOutputParser())