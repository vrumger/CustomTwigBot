import { Telegram } from 'telegraf';
import * as tt from 'telegraf/typings/telegram-types';

export interface TwigContext {
    bot: Telegram;
    updateID: number;
    update:
        | tt.IncomingMessage
        | tt.Message
        | tt.InlineQuery
        | tt.ChosenInlineResult
        | tt.CallbackQuery
        | tt.ShippingQuery
        | tt.PreCheckoutQuery
        | tt.Poll
        | tt.PollAnswer;
    from: tt.User;
    chat: tt.Chat;
    text: string;
    replyMessage?: tt.Message;
    respond: (text: string, extra?: tt.ExtraReplyMessage) => void;
    reply: (text: string, extra?: tt.ExtraReplyMessage) => void;
}
