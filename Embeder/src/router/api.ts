import express from 'express';
import * as bodyParser from 'body-parser';
import { queue } from '../queue';

export const API_ROUTER = express.Router();
API_ROUTER.use(bodyParser.json())

API_ROUTER.post('/add-to-queue', function (req, res) {
    console.log(req.body);

    queue.add(req.body);

    res.send({
        ok: true,
    })
})