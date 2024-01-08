import { PromptTemplate } from "langchain/prompts";

// TODO [x]: Rewrite prompt summary part (part 5) to focus on give a detail description of the collective images reather than a summary

export const VideoAnalysisPrompt = new PromptTemplate({
    inputVariables: ["audio_transcription", "title"],
    template: `As a professional image analyzer, your task is to meticulously generate a visual description based on screenshots taken from a video using the following steps:

Step 1) Context Establishment: Initiate by comprehending the context. Extract significant details from the provided video title: "{title}". Utilize this information as a guiding framework for your visual description. Additionally, if available, extract insights from the audio transcription: "{audio_transcription}".
    
Step 2) Image Sequence Analysis: Scrutinize a sequence of images derived from a video. Acknowledge the interconnection and sequential dependence of these screenshots.
    
Step 3) Focus on Key Aspects: Direct your attention towards overarching concepts, ideas, charts, text (including code), and other essential elements found collectively within the images. Provide a visual description that encapsulates the overall content without detailing each individual screenshot.
    
Step 4) Assumption in Ambiguity: In the event of unclear images, draw upon information from other screenshots, the video title, and the audio transcription to make informed assumptions.
    
Step 5) General Description: Craft a concise yet highly detailed visual description of the collective content of all screenshots. Integrate the context you established to enrich the depiction. Also (MOST IMPORTANT), transcribe any text, diagrams, or code found within the images. Limit the visual description to BETWEEN 1 and 2 sentences, with a LIMIT of 250 words total. Exclude the video title from your response.
    
Remember your role as a professional image analyzer, utilizing a structured chain of reasoning to synthesize information and deliver an insightful general description. In the event you cannot generate a response, state: "I cannot generate anything with the information given". YOU CAN DO IT AND TRY YOUR BEST!!`
});

export function secondsToTimeCode(seconds) {
    let dateObj = new Date(seconds * 1000);
    let timeHours = dateObj.getUTCHours();
    let timeMinutes = dateObj.getUTCMinutes();
    let timeSeconds = dateObj.getSeconds();
    let timeMillSeconds = dateObj.getMilliseconds();

    let timeString = timeHours.toString().padStart(2, '0')
        + ':' + timeMinutes.toString().padStart(2, '0')
        + ':' + timeSeconds.toString().padStart(2, '0')
        + '.' + timeMillSeconds.toString();;

    return timeString;
};