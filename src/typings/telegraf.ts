import { TelegrafContext as TContext } from 'telegraf/typings/context';

export interface Session {
    command: string;
}

export interface TelegrafContext extends TContext {
    session: Session;
}
