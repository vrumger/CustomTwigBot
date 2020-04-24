import { Composer } from 'telegraf';
import bot from '../bot';

// TODO:
bot.start(Composer.reply(`Hello`));

bot.command(`cancel`, ctx => {
    if (!ctx.session.command) {
        return ctx.reply(`No active command to cancel. I wasn't doing anything anyway. Zzzzz...`);
    }

    const { command } = ctx.session;
    ctx.session.command = null;

    ctx.reply(
        `The command ${command} has been cancelled. Anything else I can do for you?\n\nSend /help for a list of commands.`,
    );
});
