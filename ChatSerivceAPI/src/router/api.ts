import express from 'express';
import * as bodyParser from 'body-parser';

import { ChatBot, ChatBotParms } from "../chatBot.ts"
import { SearchDBParms, searchAudioEmbed, searchVisualEmbed, searchVisualEmbedForImages } from "../searchEmbed.ts"
import { LLMRewriteUserPrompt } from "../rewritePrompt.ts"

// TODO: Add queue system to and help serivce scale better
// LOOK AT: https://docs.bullmq.io/guide/queues/auto-removal-of-jobs
// Add webhooks api system for this project
export const ApiRouter = express.Router()
ApiRouter.use(bodyParser.json())

ApiRouter.post("/generate", async function (req, res) {
    try {
        let parms = req.body
        let message = await ChatBot({ videoID: parms.videoID, userPrompt: parms.userPrompt, chatHistory: [] })
        res.send(message)

    } catch (error) {
        res.send({
            error: error.message
        })
    }
})

ApiRouter.post("/chat", async function (req, res) {
    try {
        let parms: ChatBotParms = req.body
        let message = await ChatBot(parms)
        res.send(message)

    } catch (error) {
        res.send({
            error: error.message
        })
    }
})

ApiRouter.post("/searchVisualAsText", async function (req, res) {
    try {
        let parms: SearchDBParms = req.body;
        let improvePromp = await LLMRewriteUserPrompt.invoke({ userPrompt: parms.query })
        let videoContent = await searchVisualEmbed({ videoID: parms.videoID, query: improvePromp });
        res.send(videoContent)

    } catch (error) {
        res.send({
            error: error.message
        })
    }
})

ApiRouter.post("/searchVisualAsImage", async function (req, res) {
    try {
        let parms: SearchDBParms = req.body;
        let improvePromp = await LLMRewriteUserPrompt.invoke({ userPrompt: parms.query })
        let videoContent = await searchVisualEmbedForImages({ videoID: parms.videoID, query: improvePromp });
        res.send(videoContent)

    } catch (error) {
        res.send({
            error: error.message
        })
    }
})

ApiRouter.post("/searchAudio", async function (req, res) {
    try {
        let parms: SearchDBParms = req.body;
        let improvePromp = await LLMRewriteUserPrompt.invoke({ userPrompt: parms.query })
        let videoContent = await searchAudioEmbed({ videoID: parms.videoID, query: improvePromp });
        res.send(videoContent)

    } catch (error) {
        res.send({
            error: error.message
        })
    }
})



