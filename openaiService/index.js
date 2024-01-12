import { ChatOpenAI } from "langchain/chat_models/openai";
import { VideoTranscript } from "./src/VideoTranscript.js";
import 'dotenv/config';

// ! IMPORTANT FIX
// TODO: Create a token algorthiem that can sort sort the array of prompts and set of langchain to do the correct amount of prompt process

const TEST_VID_ID = "MtmWI2smwgY";

const TEST_VIDEO = new VideoTranscript(TEST_VID_ID);
await TEST_VIDEO.initialize();

console.log(TEST_VIDEO.visualTranscript);

await TEST_VIDEO.createEmbedVisualTranscript();
await TEST_VIDEO.createEmbedAudioTranscript();

console.log(TEST_VIDEO.embedAudioTranscript);
console.log(TEST_VIDEO.embedVisualTranscript);

let sortedBySearch = await TEST_VIDEO.searchVisualTranscript("What is star:52?");

console.log(sortedBySearch[0])




