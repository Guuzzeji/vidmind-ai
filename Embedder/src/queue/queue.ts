import Queue from 'bull';
import * as log from 'npmlog';
import 'dotenv/config'

import { Worker } from './Worker.ts';

log.info("Starting Queue...", new Date().toLocaleString())

export const VIDEO_PROCESSING_QUEUE = new Queue(process.env.REDIS_QUEUE_NAME,
    `redis://${process.env.REDIS_SERVER_HOST}:${process.env.REDIS_SERVER_PORT}`);

// Note:
// Job name = store id of video
// Job data = data of job
VIDEO_PROCESSING_QUEUE.process(async function (job, done) {
    log.info("Job Given - ", "ID:", job.id, "Data:", JSON.stringify(job.data))
    try {
        log.info("Running job for ...", "ID:", job.id)
        let WorkerInstance = await Worker.initialize(job.data);

        // Use for just debug queue without running OpenAI job
        if (String(process.env.SHOULD_RUN_JOB).toLocaleLowerCase() == "true") {
            await WorkerInstance.doJob()
        }

        done(null, {
            ok: true,
            id: job.id
        })

    } catch (err) {
        done(err)
    }
})