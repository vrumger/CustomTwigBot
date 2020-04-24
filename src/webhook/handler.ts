import Telegraf from 'telegraf';
import { TelegrafContext } from 'telegraf/typings/context';
import twig from 'twig';
import { TwigContext } from '../typings/webhook/handler';

const createContext = (ctx: TelegrafContext): TwigContext => ({
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
    text: ctx.message.text,
    replyMessage: ctx.message.reply_to_message,
    respond: (text, extra): void => {
        ctx.reply(text, extra);
    },
    reply: (text, extra = null): void => {
        ctx.reply(text, {
            ...extra,
            // eslint-disable-next-line @typescript-eslint/camelcase
            reply_to_message_id: ctx.message.message_id,
        });
    },
});

const _template = `
{% if text == '/id' %}
    {{ respond('<code>' ~ from.id ~ '</code>', { parse_mode: 'html' }) }}
{% elseif text starts with '/reply ' %}
    {{ reply(text|slice(${`/reply `.length}), { parse_mode: 'markdown' }) }}
{% elseif text starts with '/respond ' %}
    {{ respond(text|slice(${`/respond `.length}), { parse_mode: 'markdown' }) }}
{% endif %}
`;

const webhookHandler = async (bot: Telegraf<TelegrafContext>): Promise<void> => {
    bot.use(async ctx => {
        const template = twig.twig({ data: _template });
        const context = createContext(ctx);

        try {
            await template.renderAsync(context);
        } catch (error) {
            console.error(error);
            // TODO: notify bot owner
        }
    });
};

export default webhookHandler;
