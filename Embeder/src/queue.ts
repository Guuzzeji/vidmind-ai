import Queue from 'bull';
import * as log from 'npmlog';
import 'dotenv/config'

import { WorkerProcess } from './WorkerProcess.ts';

// TODO: Rewrite this to use express request between butcher and embeder to put job onto queue
// ! NOTE: Bullmq has weird bug when under docker, can use Bull instead or other queue manager that uses redis

log.info("Starting...", new Date().toLocaleString())

export const queue = new Queue(process.env.REDIS_QUEUE_NAME,
    `redis://${process.env.REDIS_SERVER_HOST}:${process.env.REDIS_SERVER_PORT}`);

console.log(queue)

// Note:
// Job name = store id of video
// Job data = data of job
queue.process(async function (job, done) {
    log.info("Job Given - ", "ID:", job.name, "Data:", JSON.stringify(job.data))
    try {
        let WorkerInstance = await WorkerProcess.initialize(job.data);
        log.info("Running job for ...", "ID:", job.name)
        // await WorkerInstance.doJob()
        done(null, {
            ok: true,
            id: job.name
        })
    } catch (err) {
        done(err)
    }

})

// queue.add({ data: "some data" })
