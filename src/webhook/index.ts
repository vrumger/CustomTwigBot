import http from 'http';
import url from 'url';
import Telegraf from 'telegraf';
import { Update } from 'telegraf/typings/telegram-types';
import webhookHandler from './handler';

// https://github.com/telegraf/telegraf/blob/develop/core/network/webhook.js
const server = http.createServer((req, res) => {
    const [, ...path] = url.parse(req.url).pathname.split(`/`);

    if (req.method !== `POST` || path.length !== 2 || path[0] !== `bot`) {
        res.statusCode = 403;
        return res.end();
    }

    let body = ``;

    req.on(`data`, chunk => {
        body += chunk.toString();
    });

    req.on(`end`, async () => {
        let update: Update;

        try {
            update = JSON.parse(body);
        } catch (error) {
            res.writeHead(415);
            return res.end();
        }

        try {
            const bot = new Telegraf(path[1]);

            const botInfo = await bot.telegram.getMe();
            bot.options.username = botInfo.username;
            bot.context.botInfo = botInfo;

            await webhookHandler(bot);
            await bot.handleUpdate(update, res);
        } catch (err) {
            res.writeHead(500);
        }

        if (!res.finished) {
            res.end();
        }
    });
});

export default server;
