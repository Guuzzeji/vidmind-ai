import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import 'dotenv/config'

import { searchAudioEmbed, searchVisualEmbed, convertDBEmbedResultToString } from "./searchEmbed.ts"
import { LLMSummarize } from "./summarize.ts"

export type AIChatMessage = {
    text: string,
    modifyPrompt: string,
    cite: any
}

export type ChatBotParms = {
    videoID: string,
    userPrompt: string,
    chatHistory: string[]
}

const GPT = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo-0125",
    temperature: 0.7,
    // maxTokens: 250,
    maxConcurrency: 1,
    streaming: false,
});

const chatBotPrompt = PromptTemplate.fromTemplate(
    `You are a chatbot programmed to answer user questions based on context extracted from a video. You have access to both the audio transcript and a visual description of the video content. Your task is to generate responses that are contextually relevant and informative, utilizing insights from both audio and visual cues. Ensure coherence, accuracy, and alignment with the user's query.
    
Consider:
- Contextual understanding of the video content.
- Integration of information from audio transcript and visual description.
- Alignment with the user's prompt and intent.
- Clarity and conciseness in your responses.
    
Your goal is to efficiently utilize resources while maintaining high-quality output. If you cannot answer the user's question, 
say "idk".

Visual Infomation:
{visualInfomation}

Audio Infomation:
{audioInfomation}

Chat History:
{chatHistory}

User Current Prompt:
{userPrompt}`
)

const answerUserPrompt = chatBotPrompt.pipe(GPT).pipe(new StringOutputParser())

export async function ChatBot({ videoID, userPrompt, chatHistory = [] }: ChatBotParms): Promise<AIChatMessage> {
    let audioInfomation = await searchAudioEmbed({ videoID, query: userPrompt })
    let visualInfomation = await searchVisualEmbed({ videoID, query: userPrompt })

    let msgHistory = "None"
    if (chatHistory.length != 0) {
        msgHistory = await LLMSummarize.invoke({ textToSummarize: chatHistory.toString() })
    }

    let chatMessage = await answerUserPrompt.invoke({
        visualInfomation: convertDBEmbedResultToString(visualInfomation.Frames),
        audioInfomation: convertDBEmbedResultToString(audioInfomation.Audios),
        chatHistory: msgHistory,
        userPrompt: userPrompt
    })

    return {
        text: chatMessage,
        modifyPrompt: userPrompt,
        cite: {
            frames: visualInfomation.Frames,
            audios: audioInfomation.Audios
        }
    };
}

