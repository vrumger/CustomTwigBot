import Telegraf from 'telegraf';
import { TelegrafContext } from 'telegraf/typings/context';
import { TwigContext } from '../typings/webhook/handler';
import twig from 'twig';
import Bot from '../models/bot';

const createTwigContext = (ctx: TelegrafContext): TwigContext => ({
    bot: ctx.telegram,
    updateID: ctx.update.update_id,
    update:
        ctx.message ||
        ctx.editedMessage ||
        ctx.channelPost ||
        ctx.editedChannelPost ||
        ctx.inlineQuery ||
        ctx.chosenInlineResult ||
        ctx.callbackQuery ||
        ctx.shippingQuery ||
        ctx.preCheckoutQuery ||
        ctx.poll ||
        ctx.pollAnswer,
    from: ctx.from,
    chat: ctx.chat,
    text: ctx.message?.text,
    replyMessage: ctx.message?.reply_to_message || ctx.editedMessage?.reply_to_message,
    respond: (text, extra): void => {
        ctx.reply(text, extra);
    },
    reply: (text, extra): void => {
        ctx.reply(text, {
            ...extra,
            reply_to_message_id: ctx.message.message_id,
        });
    },
});

const webhookHandler = async (bot: Telegraf<TelegrafContext>): Promise<void> => {
    bot.use(async ctx => {
        const dbBot = await Bot.findOne({ token: bot.token });

        if (dbBot && dbBot.template) {
            const template = twig.twig({ data: dbBot.template });
            const context = createTwigContext(ctx);

            try {
                // TODO: sandbox
                await template.renderAsync(context);
            } catch (error) {
                console.error(error);
                // TODO: notify bot owner
            }
        }
    });
};

export default webhookHandler;
