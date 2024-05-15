import express from 'express';
import morgan from 'morgan';
import 'dotenv/config'

/**
 * Notes
 * - https://medium.com/@Aryan_Gupta/node-js-express-typescript-eslint-boilerplate-setup-5ae761a0eff1
 */

import { ApiRouter } from './src/router/api.ts';

console.log("[BOOTUP] ChatAPI is running on port --> " + process.env.PORT)

const app = express();

app.use(morgan('tiny'))
app.use('/API', ApiRouter);

app.listen(process.env.PORT);