import * as trpcExpress from '@trpc/server/adapters/express';
import express from 'express';

/**
 * Notes
 * - https://trpc.io/docs/server/adapters/express
 * - https://trpc.io/docs/quickstart
 * - https://medium.com/@Aryan_Gupta/node-js-express-typescript-eslint-boilerplate-setup-5ae761a0eff1
 */

import { appRouter, createContext } from './src/router/api.ts';

const app = express();
app.use(
    '/API',
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext,
    }),
);

app.listen(4000);