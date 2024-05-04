import Queue from 'bull';
import * as log from 'npmlog';
import 'dotenv/config'

import { WorkerProcess } from './WorkerProcess.ts';

log.info("Starting Queue...", new Date().toLocaleString())

export const queue = new Queue(process.env.REDIS_QUEUE_NAME,
    `redis://${process.env.REDIS_SERVER_HOST}:${process.env.REDIS_SERVER_PORT}`);

// Note:
// Job name = store id of video
// Job data = data of job
queue.process(async function (job, done) {
    log.info("Job Given - ", "ID:", job.name, "Data:", JSON.stringify(job.data))
    try {
        log.info("Running job for ...", "ID:", job.name)
        let WorkerInstance = await WorkerProcess.initialize(job.data);
        await WorkerInstance.doJob()

        done(null, {
            ok: true,
            id: job.name
        })

    } catch (err) {
        done(err)
    }
})