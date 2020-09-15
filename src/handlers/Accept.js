const { Extra, Markup } = require('telegraf');
const { MODERATION_CHAT_ID, PUBLICATION_CHANNEL_ID } = process.env;
const allowCallback = async (ctx) => {
    if (!ctx.match) return;

    const [_, userId, userMessageId, reviewMessageId] = ctx.match;
    const { message } = ctx.callbackQuery;
    const adText = message.text.split('\nЛот:\n\n')[1];

    await ctx.telegram.editMessageReplyMarkup(
        MODERATION_CHAT_ID,
        reviewMessageId,
        undefined,
        Markup.inlineKeyboard([
            Markup.callbackButton(`Одобрено ${ctx.from.first_name} ${ctx.from.last_name}`, 'dummybutton'),
        ]),
    );

    const { message_id: publishedMessageId } = await ctx.telegram.sendMessage(PUBLICATION_CHANNEL_ID, `${adText}\nПисать <a href="tg://user?id=${userId}">Сюда</a>`, Extra.HTML());

    const infoString = `${reviewMessageId}_${publishedMessageId}`;
    await ctx.telegram.sendMessage(
        userId,
        `Оп! Модерация рассмотрела и одобрила твой лот. Обнови статус лота после продажи`,
        {
            reply_to_message_id: userMessageId,
            ...Extra.markup((m) => {
                return m.inlineKeyboard([m.callbackButton('Продано', `sold${infoString}`)], {});
            }),
        }
    );

    return ctx.answerCbQuery('Публикую');
};

const setupAllowCallback = (bot) => bot.action(/^allow(.+)_(.+)_(.+)$/, allowCallback);

module.exports = { setupAllowCallback };
