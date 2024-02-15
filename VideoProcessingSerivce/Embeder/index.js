import { createClient } from 'redis';
import { setTimeout } from 'timers/promises';

import { workerDoTask } from './src/worker.js';

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
    let idePendingTicket = await clientRedis.sendCommand(["XPENDING", String(process.env.REDIS_STREAM), String(process.env.REDIS_GROUP), "IDLE", String(45 * 1000), "-", "+", "1"]);

    if (pendingTicket != null && pendingTicket[0][1].length != 0) {
        let redisPackage = JSON.parse(pendingTicket[0][1][0][1][1]);
        console.log(redisPackage);

        await workerDoTask(redisPackage);

        // Remove ticket from queue
        let redisId = pendingTicket[0][1][0][0];
        await clientRedis.sendCommand(["XACK", String(process.env.REDIS_STREAM), String(process.env.REDIS_GROUP), redisId]);

    } else {
        // TODO: Write ide ticket pending process to the server to help speed up video processing
        console.log("No work to do...");
    }

    await setTimeout(5 * 1000); // Sleep before next check up
}