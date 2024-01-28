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
    temperature: 0.0,
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
    handleParsingErrors: true // used to stop error exit

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
        input: `As a professional media content analyzer, your task is to answer user questions based on the provided information about the video. Your response should utilize both the Audio Transcript and Visual Description given, along with the information obtained in the following steps:

Step 1) Extracting Key Information and Main Content: Before delving into the video details extract key information from the user's question, focusing on the main content the user is seeking. Identify details and key information that can help find the correct answer to the user's question.

Step 2) Focusing on Relevant Details for User Understanding: Once the user's question is understood, concentrate on details that are directly relevant to the user's inquiry. Provide specific information to enhance the user's understanding and address the main content the user is seeking use Audio Transcript and Visual Description given to you.

Step 3) Crafting Responses with Precision and Context: Before finalizing responses, carefully review and ensure that the crafted answers directly address the user's questions. Confirm that the responses align with the main content and key details identified in Step 1. Emphasize precision and context alignment in the answers.

Step 4) Checking Responses Against the Original Question: After generating responses, compare them to the original user question. Confirm that the responses effectively address the main content and key details identified in Step 1. Use this step as a final check to ensure that the generated answers accurately reflect the user's intent and provide valuable information.

Goal: Address the user's question effectively. Use Markdown for your responses.

Video Information:
    - Video ID: "${video.id}"
    - Visual Description:
        - Clip ${sortedVisualEmbed[0].id}: "${sortedVisualEmbed[0].text}"
        - Clip ${sortedVisualEmbed[1].id}: "${sortedVisualEmbed[1].text}"
        - Clip ${sortedVisualEmbed[2].id}: "${sortedVisualEmbed[2].text}"
    - Audio Transcript: "${sortedAudioEmbed[0].text + ' ' + sortedAudioEmbed[1].text + ' ' + sortedAudioEmbed[2].text}"

User Question: "${user.question}`
    });

    console.log("--START Embed Infomation Used ---");
    console.log(`    
    - Clip ${sortedVisualEmbed[0].id}: "${sortedVisualEmbed[0].text}"
    - Clip ${sortedVisualEmbed[1].id}: "${sortedVisualEmbed[1].text}"
    - Clip ${sortedVisualEmbed[2].id}: "${sortedVisualEmbed[2].text}"`);
    console.log("\n\n");
    console.log(`${sortedAudioEmbed[0].text + '\n\n' + sortedAudioEmbed[1].text + '\n\n' + sortedAudioEmbed[2].text}`);
    console.log("--END Embed Infomation Used ---");

    console.log("\n--- START of GPT message ---");
    console.log(msg.output);
    console.log("--- END of GPT message ---\n");
}
