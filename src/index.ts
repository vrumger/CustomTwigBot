import mongoose from 'mongoose';
import bot from './bot';
import config from './config';
import server from './webhook';

(async (): Promise<void> => {
    await mongoose.connect(config.database.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    });

    console.log(`Connected to database...`);
    await bot.launch();
    console.log(`Bot started...`);
    server.listen(config.telegram.webhook.port);
    console.log(`Webhook server started...`);
})();
