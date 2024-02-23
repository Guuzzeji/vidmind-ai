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

const summarizePrompt = PromptTemplate.fromTemplate(
    `Given a large chunk of text, your task is to generate a concise summary consisting of key points that encapsulate the most important information. Focus on distilling the main ideas, significant details, and essential insights from the text. Your summary should be structured and coherent, providing a clear overview that can be utilized by other language models (LLMs) to address user queries effectively. Aim for brevity while ensuring that the essence of the original text is preserved. Prioritize relevance and accuracy in your summary to facilitate efficient comprehension and retrieval of pertinent information.

Do not add "Summarize Text:" to your respones, just give back the summarize text that you have created.

Orginal Text: 
"{textToSummarize}"`
)

export const LLMSummarize = summarizePrompt.pipe(GPT).pipe(new StringOutputParser())

