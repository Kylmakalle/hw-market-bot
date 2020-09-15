const Telegraf = require('telegraf');
const i18n = require('./helpers/i18n.js');
const { setupAllowCallback } = require('./handlers/Accept');
const { setupDenyCallback } = require('./handlers/Deny');
const { handleMessage } = require('./handlers/Message');
const { setupSoldCallback } = require('./handlers/Sold.js');

const { BOT_TOKEN } = process.env;
if (!BOT_TOKEN) throw 'BOT_TOKEN unspecified';
const bot = new Telegraf(BOT_TOKEN);

bot.use(async (_, next) => {
    try {
        await next();
    } catch (e) {
        console.log(e);
    }
});

bot.use(i18n.middleware());

// bot.start((ctx) => {
//     ctx.i18n.locale(ctx.from!.language_code);
//     ctx.reply(ctx.i18n.t('start'));
// });
// bot.help((ctx) => {
//     ctx.i18n.locale(ctx.from!.language_code);
//     ctx.reply(ctx.i18n.t('help'));
// });
// bot.on('sticker', (ctx) => ctx.reply('👍'));

bot.on('message', handleMessage);
bot.action('dummybutton', (ctx) => {
    return ctx.answerCbQuery('Ты зачем сюда жмешь?');
})
setupAllowCallback(bot);
setupDenyCallback(bot);
setupSoldCallback(bot);

module.exports = bot;
