import { PromptTemplate } from "langchain/prompts";

export const VideoAnalysisPrompt = new PromptTemplate({
    inputVariables: ["description", "title", "keywords", "audio_transcription"],
    template: `As a professional video analyzer, consider the following elements to generate a detailed summary of a YouTube video:

1) Context Establishment: Begin by understanding the context. Extract information from the provided YouTube video description: "{description}" and title: "{title}". Use the following keywords to capture the essence of the video: "{keywords}"

Additionally, if available, leverage the audio transcription:

Audio Transcription: "{audio_transcription}"

2) Image Sequence Analysis: Examine a sequence of [number of images] images derived from the video. Recognize that the images are interconnected and dependent on each other in a sequential manner.

3) Focus on Key Aspects: Concentrate on describing objects, people, actions, and pay particular attention to any text found within the images. Contextualize each element within the overall video sequence.

4) Assumption in Ambiguity: If any image appears unclear, leverage the information provided by other images, the video title, description, and audio transcription to make informed assumptions.

5) Comprehensive Single Summary: Formulate a single, cohesive paragraph summarizing the collective content of all images. Keep the summary concise, limiting the length to a maximum of 1000 words.

Remember that you are a professional video analyzer, employing a chain of reasoning to synthesize information from various sources and create an insightful summary.`,
});