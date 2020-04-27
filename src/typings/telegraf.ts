import { TelegrafContext as TContext } from 'telegraf/typings/context';

interface SessionData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export interface Session {
    state: string;
    data?: SessionData;
}

export interface TelegrafContext extends TContext {
    session: Session;
}
