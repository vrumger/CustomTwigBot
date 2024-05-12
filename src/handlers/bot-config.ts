import Telegraf, { Markup } from 'telegraf';
import { TelegrafContext } from '../typings/telegraf';
import { User } from 'telegraf/typings/telegram-types';
import escapeHtml from '@youtwitface/escape-html';
import bot from '../bot';
import config from '../config';
import Bot from '../models/bot';
import asyncMiddleware from '../middleware/async';
import validateButton from '../middleware/validate-button';

const webhookDomain = config.WEBHOOK_DOMAIN;

bot.command(`newbot`, ctx => {
    ctx.reply(`Alright, a new bot. Please send me the token from @BotFather.`);
    ctx.session.state = `newbot`;
    ctx.session.data = null;
});

bot.on(`text`, asyncMiddleware(async (ctx, next) => {
    switch (ctx.session.state) {
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
                    parse_mode: `HTML`,
                });
            }

            await newBot.telegram.setWebhook(`${webhookDomain}/bot/${newBot.token}`);

            if (await Bot.findOne({ ownerID: ctx.from.id, botID: botInfo.id })) {
                await Bot.updateOne(
                    { ownerID: ctx.from.id, botID: botInfo.id },
                    { $set: { token: newBot.token } },
                );
            } else {
                await new Bot({
                    ownerID: ctx.from.id,
                    token: newBot.token,
                    botID: botInfo.id,
                    username: botInfo.username,
                }).save();
            }

            ctx.reply(
                `Done! Congratulations on your new bot. You will find it at @${botInfo.username}.`,
            );
            break;
        }

        case `edit template`: {
            const { botID } = ctx.session.data;
            const dbBot = await Bot.findOne({ ownerID: ctx.from.id, botID });

            if (!dbBot) {
                return ctx.reply(`Bot not found.`);
            }

            await Bot.updateOne({ _id: dbBot.id }, { $set: { template: ctx.message.text } });
            ctx.reply(`Updated.`);
            break;
        }

        default: {
            next();
            return;
        }
    }

    ctx.session.state = ctx.session.data = null;
}));

const listBotsHandler = asyncMiddleware(async (ctx: TelegrafContext): Promise<void> => {
    const ownerID = Number(ctx.match?.[1] ?? ctx.from.id);
    const bots = await Bot.find({ ownerID });

    const buttons = [];
    const _buttons = bots.map(_bot => ({
        text: `@${_bot.username}`,
        callback_data: `bot:${ctx.from.id}:${_bot.botID}`,
    }));

    while (_buttons.length) {
        buttons.push(_buttons.splice(0, 2));
    }

    ctx[ctx.match ? `editMessageText` : `reply`](`Choose a bot from the list below:`, {
        reply_markup: {
            inline_keyboard: buttons,
        },
    });

    if (ctx.callbackQuery) {
        ctx.answerCbQuery();
    }
});

bot.command(`mybots`, listBotsHandler);
bot.action(/^bots:(\d+)$/, validateButton, listBotsHandler);

bot.action(/^bot:(\d+):(\d+)$/, validateButton, asyncMiddleware(async ctx => {
    const [, ownerID, botID] = ctx.match.map(x => Number(x));
    const dbBot = await Bot.findOne({ ownerID, botID });

    if (!dbBot) {
        return ctx.answerCbQuery(`Bot not found.`);
    }

    ctx.answerCbQuery();
    ctx.editMessageText(`Here it is: @${dbBot.username}.\nWhat do you want to do with the bot?`, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: `Edit Template`,
                        callback_data: `edit template:${ownerID}:${botID}`,
                    },
                    {
                        text: `Transfer Bot`,
                        callback_data: `transfer bot:${ownerID}:${botID}`,
                    },
                ],
                [
                    {
                        text: `Delete Bot`,
                        callback_data: `delete bot:${ownerID}:${botID}`,
                    },
                    {
                        text: `« Back to Bots List`,
                        callback_data: `bots:${ownerID}`,
                    },
                ],
            ],
        },
    });
}));

bot.action(/^edit template:(\d+):(\d+)$/, validateButton, asyncMiddleware(async (ctx: TelegrafContext) => {
    const [, ownerID, botID] = ctx.match.map(x => Number(x));
    const dbBot = await Bot.findOne({ ownerID, botID });

    if (!dbBot) {
        return ctx.answerCbQuery(`Bot not found.`);
    }

    ctx.editMessageText(
        `OK. Send me the new template for your bot.`,
        Markup.inlineKeyboard([[Markup.callbackButton(`« Back to Bot`, `bot:${ownerID}:${botID}`)]]).extra(),
    );

    ctx.session.state = `edit template`;
    ctx.session.data = { botID };
}));
