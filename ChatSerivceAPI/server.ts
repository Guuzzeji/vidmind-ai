import express from 'express';

/**
 * Notes
 * - https://medium.com/@Aryan_Gupta/node-js-express-typescript-eslint-boilerplate-setup-5ae761a0eff1
 */

import { ApiRouter } from './src/router/api.ts';

const app = express();
app.use('/API', ApiRouter);

app.listen(4000);