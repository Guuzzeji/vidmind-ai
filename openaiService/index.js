import { OpenAI } from "langchain/llms/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage } from "langchain/schema";
import { VideoAnalysisPrompt, secondsToTimeCode } from './src/prompts/videoAnalyze.js';
import { createTranscript, findTranscriptionWithBounds, trimTextByTokenAmount } from './src/whisper.js';
import { encode } from 'gpt-tokenizer';
import 'dotenv/config';
import axios from 'axios';

// console.log(process.env.OPENAI_API_KEY)

// ! IMPORTANT FIX
// TODO: Remove transcript crap and just have GPT create the best visial transcript that can be used within a embed
//      - Doing this will allow use to run things using batches and spend up generations
//      - Doing this will can also fix the issue of blancing clip sizes, we can bigger chunk gaps and just use more images ot be process
//      - Refine the prompt more and make it better while using less tokens 
//      - Doing this we can also fix the issue of rate limiting in terms of tokens and request per day
//      - Play around more with video breaker, rememeber more clips the better, but not too much.
// TODO: Clean up video descprtion to take less token
// TODO: Create a token algorthiem that can sort sort the array of prompts and set of langchain to do the correct amount of prompt process

const TEST_VID_ID = "5o6IbenbaBw";


let videoInfo = await axios.post("http://localhost:8080/API/process-yt-video", {
    "vid_id": TEST_VID_ID
});
videoInfo = videoInfo.data;
// console.log(videoInfo);

let videoMetaData = await axios.post("http://localhost:8080/API/get-video-info", {
    "vid_id": TEST_VID_ID
});
videoMetaData = videoMetaData.data;
// console.log(videoMetaData);

let transcript = await createTranscript(videoInfo.vid_paths.audio);

let prompts = [];
for (let x = 0; x < videoInfo.clips.length; x++) {
    let text = findTranscriptionWithBounds(transcript, videoInfo.clips[x].start, videoInfo.clips[x].end);
    text = trimTextByTokenAmount(text, 130);
    console.log(text);

    let prompt = await VideoAnalysisPrompt.format({
        // description: videoMetaData.description.replaceAll("\\n", " "),
        // keywords: videoMetaData.keywords.length == 0 ? "None" : videoMetaData.keywords.slice(0, videoMetaData.keywords.length - 3).toString(),
        title: videoMetaData.title,
        audio_transcription: text,
        // start_time: secondsToTimeCode(videoInfo.clips[x].start),
        // end_time: secondsToTimeCode(videoInfo.clips[x].end)
    });

    // console.log("======");
    // console.log(prompt);
    console.log(encode(prompt).length + 85);

    let imgs = await axios.post("http://localhost:8080/API/frames-from-video", {
        "vid_id": TEST_VID_ID,
        "clip_num": x
    });
    imgs = imgs.data;
    // console.log(imgs);
    // console.log(imgs.frames);

    prompts.push([
        new HumanMessage({
            content: [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "data:image/jpeg;base64," + imgs.frames,
                        "detail": "low",
                    }
                },
                { "type": "text", "text": prompt }
            ]
        })
    ]);
}

// console.log(prompts[0][0].content);

const chat = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4-vision-preview",
    temperature: 0,
    maxTokens: 150,
    maxConcurrency: 3,
    streaming: false,
    stop: "\n"
});

let respones = await chat.batch(prompts);

console.log(respones);



// Notes:
// https://platform.openai.com/docs/api-reference/audio/createTranscription?lang=node
// https://medium.com/@bezbos./openai-audio-whisper-api-guide-36e7272731dc
// https://js.langchain.com/docs/expression_language/cookbook/multiple_chains
// https://www.youtube.com/watch?v=IZGBshGqB3g
// https://www.youtube.com/watch?v=PlxWf493en4&t=581s
// https://github.com/langchain-ai/langchain/blob/master/cookbook/openai_v1_cookbook.ipynb
// https://js.langchain.com/docs/expression_language/cookbook/prompt_llm_parser
// https://api.js.langchain.com/classes/langchain_chat_models_openai.ChatOpenAI.html#batch
// https://api.js.langchain.com/classes/langchain_prompts.PromptTemplate.html#batch
// https://js.langchain.com/docs/modules/model_io/models/chat/
// https://www.sitepoint.com/langchain-javascript-complete-guide/
// https://js.langchain.com/docs/modules/model_io/models/llms/how_to/dealing_with_rate_limits
// https://github.com/langchain-ai/langchain/blob/master/cookbook/openai_v1_cookbook.ipynb
// https://platform.openai.com/docs/guides/rate-limits/usage-tiers?context=tier-three
// https://js.langchain.com/docs/modules/model_io/models/chat/
// https://medium.com/@nageshmashette32/gpt4-vision-and-its-alternatives-6ed9d39508cd
// https://medium.com/@astropomeai/gpt-4-vision-trying-out-real-time-image-analysis-based-on-context-31213a558153
// https://www.scenedetect.com/docs/latest/api/detectors.html#module-scenedetect.detectors.adaptive_detector
// https://pytube.io/en/latest/api.html#stream-object
// https://github.com/jiaaro/pydub
// https://community.openai.com/t/how-can-i-improve-response-times-from-the-openai-api-while-generating-responses-based-on-our-knowledge-base/237169/2
// https://www.npmjs.com/package/gpt-tokenizer
// https://www.scenedetect.com/cli/
// 