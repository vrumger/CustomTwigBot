import ini from 'ini';
import { readFileSync } from 'fs';

interface Config {
    telegram: {
        token: string;
        webhook: {
            domain: string;
            port: number;
        };
    };
    database: {
        mongoURI: string;
    };
}

const config: Config = ini.parse(readFileSync(`./config.ini`, `utf-8`));

export default config;
