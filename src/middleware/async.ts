import { MiddlewareFn } from 'telegraf/typings/composer';
import { TelegrafContext } from '../typings/telegraf';

type Middleware = MiddlewareFn<TelegrafContext>;

const asyncMiddleware = (middleware: Middleware): Middleware => (ctx, next): void => {
    middleware(ctx, next);
};

export default asyncMiddleware;
