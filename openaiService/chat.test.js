import prompt from 'prompt';
import process from 'node:process';
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createReactAgent } from "langchain/agents";
// import { PromptTemplate } from "@langchain/core/prompts";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";

import { VideoTranscript } from './src/VideoTranscript.js';
import { ClipSearchTool } from './src/functionCalling/answerImageQuestion.js';

const OPENAI_CALL = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo-1106",
    temperature: 0.5,
    // maxTokens: 250,
    maxConcurrency: 1,
    streaming: true,
});

// TODO: Copy this from site to not have to do pulling stuff
const chatPrompt = await pull("hwchase17/react");

const agent = await createReactAgent({
    llm: OPENAI_CALL,
    tools: [
        ClipSearchTool,
    ],
    prompt: chatPrompt,

});

const agentExecutor = new AgentExecutor({
    agent,
    tools: [
        ClipSearchTool,
    ],
    verbose: true,
    returnIntermediateSteps: true,
    maxIterations: 10,
});

prompt.start();

console.log("---");

let video = await prompt.get(["id"]);
let videoMetaData = new VideoTranscript(video.id);
await videoMetaData.initialize();
await videoMetaData.createEmbedVisualTranscript();
await videoMetaData.createEmbedAudioTranscript();

console.log(`Downloaded => ${video.id} \n`);

while (true) {
    let user = await prompt.get(["question"]);
    let sortedVisualEmbed = await videoMetaData.searchVisualTranscript(user.question);
    let sortedAudioEmbed = await videoMetaData.searchAudioTranscript(user.question);

    let msg = await agentExecutor.invoke({
        input: `As a professional media content analyzer, your task is to answer user questions based on the provided information about the video. Your response should utilize both the Audio Transcript and Visual Description given, along with the infomation given to you by tools.

Your primary goal is to address the user's question effectively.
        
Craft your responses with precision and clarity, focusing on delivering accurate and relevant information to meet the user's inquiry. You should always write your responses in Markdown.
        
If you cannot come up with a solution to the question, please write "Sorry cannot answer this question."

Video Information:
    Video ID: "${video.id}"
    Visual Description:
        Clip ${sortedVisualEmbed[0].id}: "${sortedVisualEmbed[0].text}"
        Clip ${sortedVisualEmbed[1].id}: "${sortedVisualEmbed[1].text}"
        Clip ${sortedVisualEmbed[2].id}: "${sortedVisualEmbed[2].text}"
        Audio Transcript: "${sortedAudioEmbed[0].text + ' ' + sortedAudioEmbed[1].text + ' ' + sortedAudioEmbed[2].text}"

User Question: ${user.question}`
    });

    console.log("--START Embed Infomation Used ---");
    console.log(`    
    - Clip ${sortedVisualEmbed[0].id}: "${sortedVisualEmbed[0].text}"
    - Clip ${sortedVisualEmbed[1].id}: "${sortedVisualEmbed[1].text}"
    - Clip ${sortedVisualEmbed[2].id}: "${sortedVisualEmbed[2].text}"`);
    console.log("\n\n");
    console.log(`${sortedAudioEmbed[0].text + '\n\n' + sortedAudioEmbed[1].text + '\n\n' + sortedAudioEmbed[2].text}`);
    console.log("--END Embed Infomation Used ---");

    console.log("--- START of GPT message ---");
    console.log(msg.output);
    console.log("--- END of GPT message ---\n");
}
