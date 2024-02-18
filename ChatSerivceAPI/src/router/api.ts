import express from 'express';
import * as bodyParser from 'body-parser';

import { ChatBot, ChatBotParms } from "../chatBot.ts"
import { SearchDBParms, searchDBEmbeddings } from "../searchEmbed.ts"
import { LLMRewritUserPrompt } from "../rewritePrompt.ts"

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

ApiRouter.post("/search", async function (req, res) {
    try {
        let parms: SearchDBParms = req.body;
        let improvePromp = await LLMRewritUserPrompt.invoke({ userPrompt: parms.query })
        let videoContent = await searchDBEmbeddings({ videoID: parms.videoID, query: improvePromp });
        res.send(videoContent)

    } catch (error) {
        res.send({
            error: error.message
        })
    }
})


