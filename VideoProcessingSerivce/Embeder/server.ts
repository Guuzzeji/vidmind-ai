import { createClient } from 'redis';
import { setTimeout } from 'timers/promises';

import { Worker } from './src/Worker.ts';

// TODO: USE 
// - https://github.com/taskforcesh/bullmq?tab=readme-ov-file
// - https://bullmq.io/
// - https://docs.bullmq.io/guide/queues/auto-removal-of-jobs
// - Note: use bullmq with python code
// - https://www.youtube.com/watch?v=JfM1mr2bCuk
async function run() {
    const clientRedis = await createClient({
        url: process.env.REDIS_URL
    }).connect();

    try {
        await clientRedis.sendCommand(["XGROUP", "CREATE", String(process.env.REDIS_STREAM), String(process.env.REDIS_GROUP), "$", "MKSTREAM"]);
    } catch (err) {
        console.log(err);
        console.log("Can igorne if saying group already created");
    }

    while (true) {
        console.log("Checking...");
        let pendingTicket = await clientRedis.sendCommand(["XREADGROUP", "GROUP", String(process.env.REDIS_GROUP), String(process.env.REDIS_WORKER_NAME), "STREAMS", String(process.env.REDIS_STREAM), ">"]);

        if (pendingTicket != null && pendingTicket[0][1].length != 0) {
            let redisPackage = JSON.parse(pendingTicket[0][1][0][1][1]);
            console.log(redisPackage);

            let WorkerInstance = await Worker.initialize(redisPackage);
            await WorkerInstance.doJob()

            // Remove ticket from queue
            let redisId = pendingTicket[0][1][0][0];
            await clientRedis.sendCommand(["XACK", String(process.env.REDIS_STREAM), String(process.env.REDIS_GROUP), redisId]);

        } else {
            // TODO: Write ide ticket pending process to the server to help speed up video processing
            console.log("No work to do...");
        }

        await setTimeout(5 * 1000); // Sleep before next check up
    }
}

run();