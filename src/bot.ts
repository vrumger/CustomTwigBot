import Telegraf, { session } from 'telegraf';
import { TelegrafContext } from './typings/telegraf';
import config from './config';

const bot = new Telegraf<TelegrafContext>(config.BOT_TOKEN);

bot.catch(console.error);
bot.use(session());

export default bot;

import './handlers/misc';
import './handlers/bot-config';
