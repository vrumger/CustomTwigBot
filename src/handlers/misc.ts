import { Composer } from 'telegraf';
import bot from '../bot';

// TODO:
bot.start(Composer.reply(`Hello`));

bot.command(`cancel`, ctx => {
    if (!ctx.session.state) {
        return ctx.reply(`No active command to cancel. I wasn't doing anything anyway. Zzzzz...`);
    }

    const { state } = ctx.session;
    ctx.session.state = null;

    ctx.reply(
        `The command ${state} has been cancelled. Anything else I can do for you?\n\nSend /help for a list of commands.`,
    );
});
