import Telegraf from 'telegraf';
import { User } from 'telegraf/typings/telegram-types';
import escapeHtml from '@youtwitface/escape-html';
import bot from '../bot';
import config from '../config';

const webhookDomain = config.telegram.webhook.domain;

bot.command(`newbot`, ctx => {
    ctx.reply(`Alright, a new bot. Please send me the token from @BotFather.`);
    ctx.session.command = `newbot`;
});

bot.on(`text`, async (ctx, next) => {
    switch (ctx.session.command) {
        default:
            next();
            break;

        case `newbot`: {
            const { text } = ctx.message;
            const match = text && text.match(/(\d+:[a-z0-9_-]+)/i);

            if (!match) {
                return ctx.reply(`Invalid token.`);
            }

            const [, token] = match;
            const newBot = new Telegraf(token);
            let botInfo: User;

            try {
                botInfo = await newBot.telegram.getMe();
            } catch (error) {
                const errorMessage = escapeHtml(error.description || error.message);
                return ctx.reply(`There was an error: <code>${errorMessage}</code>`, {
                    // eslint-disable-next-line @typescript-eslint/camelcase
                    parse_mode: `HTML`,
                });
            }

            await newBot.telegram.setWebhook(`${webhookDomain}/bot/${newBot.token}`);
            ctx.reply(`Done! Congratulations on your new bot. You will find it at @${botInfo.username}.`);
            ctx.session.command = null;
        }
    }
});
