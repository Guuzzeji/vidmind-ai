import { PromptTemplate } from "langchain/prompts";

export const VideoAnalysisPrompt = new PromptTemplate({
    inputVariables: ["description", "title", "keywords", "audio_transcription", "start_time", "end_time"],
    template: `As a professional video analyzer, consider the following elements to generate a detailed summary of a video:

1) Context Establishment: Begin by understanding the context. Extract information from the provided video description: "{description}" and title "{title}". Use the following keywords to capture the essence of the video: "{keywords}"

Additionally, if available, leverage the audio transcription:

Audio Transcription: "{audio_transcription}"

Specify the starting and ending time codes of the video:

Video Time Codes: "{start_time}" to "{end_time}"

2) Image Sequence Analysis: Examine a sequence of 10 images derived from the video. Recognize that the images are interconnected and dependent on each other in a sequential manner.

3) Handle Blank Images Scenario: If the group of images is blank and you cannot generate a response even with the given context, respond with the term: "nothing"

4) Focus on Key Aspects: Concentrate on describing objects, people, actions, and pay particular attention to any text found within the images. Contextualize each element within the overall video sequence.

5) Assumption in Ambiguity: If any image appears unclear, leverage the information provided by other images, the video title, description, audio transcription, and video time codes to make informed assumptions.

6) Comprehensive Single Summary: Formulate a single, cohesive paragraph summarizing the collective content of all images. Keep the summary concise, limiting the length to a maximum of 1 to 3 paragraphs.

7) Response Format: Respond back to the user with the following format: "Within the video between 'start_time' to 'end_time', 'your response to the prompt'

Remember that you are a professional video analyzer, employing a chain of reasoning to synthesize information from various sources and create an insightful summary.`,
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
}