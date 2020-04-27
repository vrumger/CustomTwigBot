import dotenv from 'dotenv';
import envalid, { str, num } from 'envalid';

dotenv.config();

const config = envalid.cleanEnv(process.env, {
    BOT_TOKEN: str(),
    WEBHOOK_DOMAIN: str(),
    WEBHOOK_PORT: num({ default: 1421 }),
    MONGO_URI: str(),
});

export default config;
