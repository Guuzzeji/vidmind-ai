import { PromptTemplate } from "@langchain/core/prompts";

// TODO: Fine tune prompt to get the best results
// TODO: Move all prompts to .txt file instead of storing them here in the js file
export const RefineImageSearchPrompt = new PromptTemplate({
    inputVariables: ["user_question"],
    template: `As a professional Media Content Analyst, your task is to answer a user question based on screenshots taken from a video using the following steps:
    
Step 1) Image Sequence Analysis: Scrutinize a sequence of images derived from a video. Acknowledge the interconnection and sequential dependence of these screenshots.
    
Step 2) Focus on Key Aspects: Direct your attention towards overarching actions, charts, diagrams, text (including code), and other essential elements found collectively within the images.
    
Step 3) Assumption in Ambiguity: In the event of unclear images, draw upon information from other screenshots, the video title, and the audio transcription to make informed assumptions.
    
Step 4) Response to User Answer: Craft a detailed response to the user's question, use all the detail collected to explain. Only use the context given to you in the screenshot sequence to answer the user's question. Do not use outside infomation.
    
Remember your role as a professional Media Content Analyst, your task is to answer a user question based on screenshots taken from a video. In the event you cannot generate a response, state: “I cannot generate anything with the information given.” 

Remember to always try to answer the user's question no matter what!!

You should write your response down in Markdown and DO NOT write down your steps used to answer the user's question, just give your final respone to the user's question.

User Question: "{user_question}"

Screenshots From Video As One Single Image:`});

//Given a sequence of screenshots from a video, ask the AI specific questions about the content of the images, and the AI will generate detailed responses based on the visual information. Ensure your questions are focused on the details present in the screenshots, and the AI will provide informative answers."
