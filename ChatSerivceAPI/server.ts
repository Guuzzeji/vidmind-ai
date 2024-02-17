import * as trpcExpress from '@trpc/server/adapters/express';
import express from 'express';

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