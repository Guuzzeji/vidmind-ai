import prompt from 'prompt';
import process from 'node:process';
import { ChatOpenAI } from "langchain/chat_models/openai";
import { VideoTranscript } from './src/VideoTranscript.js';


const OPENAI_CALL = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo-1106",
    temperature: 0.5,
    // maxTokens: 250,
    maxConcurrency: 1,
    streaming: true,
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

    let gptPrompt = `As a professional media content analyzer, your task is to answer user questions based on the provided information about the video. The user is inquiring about "${user.question}". Your response should utilize both the Audio Transcript and Visual Description given.

Ensure that your answers rely solely on the provided information; refrain from using external sources. Your primary goal is to address the user's question effectively.

Video Information:
- Visual Description: ${sortedVisualEmbed[0].text + ' ' + sortedVisualEmbed[1].text + ' ' + sortedVisualEmbed[2].text}
- Audio Transcript: ${sortedAudioEmbed[0].text + ' ' + sortedAudioEmbed[1].text + ' ' + sortedAudioEmbed[2].text}

Craft your responses with precision and clarity, focusing on delivering accurate and relevant information to meet the user's inquiry. You should always write your responses in Markdown.`;

    let msg = await OPENAI_CALL.invoke(gptPrompt);

    console.log("--START Embed Infomation Used ---");
    console.log(`${sortedVisualEmbed[0].text + '\n\n' + sortedVisualEmbed[1].text + '\n\n' + sortedVisualEmbed[2].text}`);
    console.log("\n\n");
    console.log(`${sortedAudioEmbed[0].text + '\n\n' + sortedAudioEmbed[1].text + '\n\n' + sortedAudioEmbed[2].text}`);
    console.log("--END Embed Infomation Used ---");

    console.log("--- START of GPT message ---");
    console.log(msg.content);
    console.log("--- END of GPT message ---\n");
}
