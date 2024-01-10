import { ChatOpenAI } from "langchain/chat_models/openai";
import { VideoTranscript } from "./src/VideoTranscript.js";
import 'dotenv/config';

// ! IMPORTANT FIX
// TODO: Create a token algorthiem that can sort sort the array of prompts and set of langchain to do the correct amount of prompt process

const TEST_VID_ID = "SmyPTnlqhlk";

let videoBreakDown = new VideoTranscript(TEST_VID_ID);
videoBreakDown.initialize();

for (let text of videoBreakDown.visualTranscript) {
    console.log(text);
}





