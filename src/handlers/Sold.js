const { Markup, Extra } = require('telegraf');

const { MODERATION_CHAT_ID, PUBLICATION_CHANNEL_ID } = process.env;

const soldCallback = async (ctx) => {
    const [_, reviewMessageId, publishedMessageId] = ctx.match;
    const message = ctx.callbackQuery.message;
    const replyTo = message.reply_to_message;
    await ctx.telegram.editMessageReplyMarkup(
        MODERATION_CHAT_ID,
        reviewMessageId,
        undefined,
        Markup.inlineKeyboard([Markup.callbackButton(`Продано`, 'dummybutton')]),
    );

    await ctx.telegram.editMessageText(ctx.chat.id, message.message_id, undefined, 'Поздравляем с продажей!');
    if (replyTo) {
        await ctx.telegram.editMessageText(
            PUBLICATION_CHANNEL_ID,
            publishedMessageId,
            undefined,
            `<b>Продано</b>\n<s>${message.reply_to_message.text}</s>`,
            Extra.HTML(),
        );
    } else {
        await ctx.telegram.deleteMessage(PUBLICATION_CHANNEL_ID, publishedMessageId);
    }
    return ctx.answerCbQuery('Закрываю');
};

const setupSoldCallback = (bot) => bot.action(/^sold(.+)_(.+)$/, soldCallback);

module.exports = { setupSoldCallback };
