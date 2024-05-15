import express from 'express';
import * as bodyParser from 'body-parser';
import { VIDEO_PROCESSING_QUEUE } from '../queue/queue';

export const API_ROUTER = express.Router();
API_ROUTER.use(bodyParser.json())

API_ROUTER.post('/add-to-queue', function (req, res) {
    // console.log(req.body);

    VIDEO_PROCESSING_QUEUE.add(req.body);

    res.send({
        ok: true,
    })
})