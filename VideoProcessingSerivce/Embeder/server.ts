import { Worker, Job, Queue } from 'bullmq';
import { setTimeout } from 'timers/promises';
import * as log from 'npmlog';
import 'dotenv/config'

import { WorkerProcess } from './src/WorkerProcess.ts';

const CONNECTION_REDIS = {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT)
}

const queue = new Queue(process.env.REDIS_QUEUE_NAME);

// Note:
// Job name = store id of video
// Job data = data of job
const worker = new Worker(process.env.REDIS_QUEUE_NAME, async (job: Job) => {
    log.info("Job Given - ", "ID:", job.name, "Data:", JSON.stringify(job.data))
    try {
        let WorkerInstance = await WorkerProcess.initialize(job.data);
        log.info("Running job for ...", "ID:", job.name)
        await WorkerInstance.doJob()
        return {
            ok: true,
            id: job.name
        }
    } catch (err) {
        return {
            ok: false,
            err: err
        }
    }

}, {
    connection: CONNECTION_REDIS,
    autorun: false,
    removeOnComplete: {
        count: 1000
    },
    removeOnFail: {
        count: 5000
    }
});

async function main() {
    log.info("Starting...", new Date().toLocaleString())
    while (true) {
        log.info("Checking for Work | Queue Size - ", await queue.count())

        if (!worker.isRunning()) {
            worker.run();

            // NOTE: Should add pub/sub with redis to send upates on progress of video processing
            worker.on('completed', (job: Job, returnvalue: any) => {
                log.info("Job Completed - ", job.name, returnvalue)
            });

            worker.on('failed', (job: Job, error: Error) => {
                log.info("Job Failed - ", job.name, error)
            });
        }

        log.info("Sleeping at", new Date().toLocaleString())
        await setTimeout(5 * 1000); // Sleep before next check up
    }
}

main()