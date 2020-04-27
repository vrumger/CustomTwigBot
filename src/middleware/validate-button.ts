import { MiddlewareFn } from 'telegraf/typings/composer';
import { TelegrafContext } from '../typings/telegraf';

const _return = (ctx: TelegrafContext, message?: string): void => {
    if (ctx.callbackQuery) {
        ctx.answerCbQuery(message);
    }
};

const validateButton: MiddlewareFn<TelegrafContext> = (ctx, next) => {
    if (!ctx.match) {
        return _return(ctx);
    }

    const [, ownerID] = ctx.match;

    if (Number(ownerID) !== ctx.from.id) {
        return _return(ctx, `This button isn't for you.`);
    }

    next();
};

export default validateButton;
