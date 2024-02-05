import { createClient } from 'redis';
import { setTimeout } from 'timers/promises';

import { workerDoTask } from './src/worker.js';

const clientRedis = await createClient({
    url: process.env.REDIS_URL
}).connect();


while (true) {
    console.log("Checking...");
    let pendingTicket = await clientRedis.sendCommand(["XREADGROUP", "GROUP", "embed_worker", "worker0", "STREAMS", "EMBED_TICKETS", ">"]);
    let idePendingTicket = await clientRedis.sendCommand(["XPENDING", "EMBED_TICKETS", "embed_worker", "IDLE", String(45 * 1000), "-", "+", "1"]);

    if (pendingTicket != null && pendingTicket[0][1].length != 0) {
        let redisPackage = JSON.parse(pendingTicket[0][1][0][1][1]);
        // console.log(redisPackage);

        await workerDoTask(redisPackage);

        // Remove ticket from queue
        let redisId = pendingTicket[0][1][0][0];
        await clientRedis.sendCommand(["XACK", "EMBED_TICKETS", "embed_worker", redisId]);

    } else if (idePendingTicket != null && idePendingTicket[0] != undefined) {
        let redisId = idePendingTicket[0][0];
        let redisGroup = idePendingTicket[0][1];

        let getPackageMsg = await clientRedis.sendCommand(["XREAD", "STREAMS", "EMBED_TICKETS", redisId]);
        let redisPackage = JSON.parse(getPackageMsg[0][1][0][1][1]);
        // console.log(redisPackage);

        await workerDoTask(redisPackage);

        // Remove ticket from queue
        await clientRedis.sendCommand(["XACK", "EMBED_TICKETS", redisGroup, redisId]);
    } else {
        console.log("No work to do...");
    }

    await setTimeout(5 * 1000); // Sleep before next check up
}