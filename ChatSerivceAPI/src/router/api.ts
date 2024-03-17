import express from 'express';
import * as bodyParser from 'body-parser';

import { ChatBot } from "../chatBot.ts"
import { searchAudioEmbed, searchVisualEmbed, searchVisualEmbedForImages } from "../searchEmbed.ts"
import { LLMRewriteUserPrompt } from "../rewritePrompt.ts"
import { describeImage } from '../describeImage.ts';
import { searchForVideos } from '../searchForVideos.ts'

// TODO: Add queue system to and help serivce scale better
// LOOK AT: https://docs.bullmq.io/guide/queues/auto-removal-of-jobs
// Add webhooks api system for this project
export const ApiRouter = express.Router()
ApiRouter.use(bodyParser.json())

// TODO: Refactor to use less urls, use post type within json
type GenerateBodyRequest = {
    videoID: string,
    type: "text" | "image",
    chatHistory: string[],
    prompt: string,
    imgBase64: string | undefined,
}

ApiRouter.post("/generate", async function (req, res) {
    try {
        let parms: GenerateBodyRequest = req.body
        let userPrompt: string;

        if (parms.type == "text") {
            userPrompt = await LLMRewriteUserPrompt.invoke({ userPrompt: parms.prompt })
        } else if (parms.type == "image") {
            userPrompt = await describeImage(parms.imgBase64)
        }

        let message = await ChatBot({ videoID: parms.videoID, userPrompt: userPrompt, chatHistory: parms.chatHistory })
        res.send(message)

    } catch (error) {
        res.send({
            error: error.message
        })
    }
})


type SearchBodyRequest = {
    searchFor: "image" | "imgtext" | "audio",
    searchBy: "image" | "text",
    videoID: string,
    query: string | undefined,
    imgBase64: string | undefined
}

ApiRouter.post("/search", async function (req, res) {
    try {
        let parms: SearchBodyRequest = req.body
        let searchQuery: string;

        if (parms.searchBy == 'image') {
            searchQuery = await describeImage(parms.imgBase64)
        } else if (parms.searchBy == 'text') {
            searchQuery = await LLMRewriteUserPrompt.invoke({ userPrompt: parms.query })
        } else {
            res.send("no searchBy define")
        }

        if (parms.searchFor == 'image') {
            let videoContent = await searchVisualEmbedForImages({ videoID: parms.videoID, query: searchQuery });
            console.log(videoContent)
            res.send(videoContent)

        } else if (parms.searchFor == 'audio') {
            let videoContent = await searchAudioEmbed({ videoID: parms.videoID, query: searchQuery });
            res.send(videoContent)

        } else if (parms.searchFor == 'imgtext') {
            let videoContent = await searchVisualEmbed({ videoID: parms.videoID, query: searchQuery });
            res.send(videoContent)
        } else {
            res.send("Search For was not defined")
        }

    } catch (error) {
        res.send({
            error: error.message
        })
    }
})

ApiRouter.get("/videos", async function (req, res) {
    try {
        let videos = await searchForVideos();
        res.send(videos)

    } catch (error) {
        res.send({
            error: error.message
        })
    }
})



