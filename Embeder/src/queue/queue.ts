import Queue from 'bull';
import OpenAI from 'openai';
import * as log from 'npmlog';
import 'dotenv/config'

import { VideoWorker } from './VideoWorker.ts';
import { sleep } from '../utils.ts';

log.info("Starting Queue...", new Date().toLocaleString())

const OPENAI = new OpenAI();

export const VIDEO_PROCESSING_QUEUE = new Queue("video-processing-ticket-pool",
    `redis://${process.env.REDIS_SERVER_HOST}:${process.env.REDIS_SERVER_PORT}`);

export const OPENAI_BATCH_CHECKING_QUEUE = new Queue("openai-batch-status-check-pool",
    `redis://${process.env.REDIS_SERVER_HOST}:${process.env.REDIS_SERVER_PORT}`);

// Note:
// Job name = store id of video
// Job data = data of job
VIDEO_PROCESSING_QUEUE.process(async function (job, done) {
    log.info("Job Given Video Procecssing - ", "ID:", job.id, "Data:", JSON.stringify(job.data))
    try {
        log.info("Running job for ...", "ID:", job.id)
        let WorkerInstance = new VideoWorker(job.data);

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

OPENAI_BATCH_CHECKING_QUEUE.process(async function (job, done) {
    log.info("Job Given Batch Checkup - ", "ID:", job.id, "Data:", JSON.stringify(job.data))
    const batch = await OPENAI.batches.retrieve(job.data.batchId);

    if (batch.status == "completed") {



        done(null, {
            ok: true,
            id: job.id
        })

    } else if (batch.status == "failed") {
        log.info("Batch Checkup FAILED - ", "ID:", job.id, "Video ID:", batch.input_file_id)
        done(new Error(`BATCH FAILED ${batch.input_file_id} has failed`))

    } else {
        done(null, {
            ok: true,
            id: job.id
        })

        OPENAI_BATCH_CHECKING_QUEUE.add(job.data)
    }

    await sleep(1000 * 60)
})