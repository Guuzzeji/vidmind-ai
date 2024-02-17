import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { z } from 'zod';

// created for each request
export const createContext = ({ req, res, }: trpcExpress.CreateExpressContextOptions) => (console.log(req, res), {}); // no context
type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
    getUser: t.procedure.input(z.string()).query((opts) => {
        opts.input; // string
        return { id: opts.input, name: 'Bilbo' };
    }),
    helloworld: t.procedure.query((opts) => {// string
        return { id: opts.input, name: 'Bilbo' };
    }),
    createUser: t.procedure
        .input(z.object({ name: z.string().min(5) }))
        .mutation(async () => {
            // use your ORM of choice
            return {
                data: "hello"
            }
        }),
});

// export type definition of API
export type AppRouter = typeof appRouter;