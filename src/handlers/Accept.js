import { Extra, Markup } from 'telegraf';
import { User } from '../../build/models/User';

const { MODERATION_CHAT_ID, PUBLICATION_CHANNEL_ID } = process.env;

const allowCallback = async (ctx) => {
    if (!ctx.match) return;

    const [_, userId, userMessageId, reviewMessageId] = ctx.match;
    const { from, text, caption, photo } = ctx.callbackQuery.message;
    const photoId = photo ? photo[0].file_id : undefined;
    const user = new User(from);
    const actualText = text ? text : caption;
    const adText = actualText.split('\nЛот:\n\n')[1];

    await ctx.telegram.editMessageReplyMarkup(
        MODERATION_CHAT_ID,
        reviewMessageId,
        undefined,
        Markup.inlineKeyboard([
            Markup.callbackButton(`Одобрено ${user.first_name} ${user.last_name}`, 'dummybutton'),
        ]),
    );

    let response;
    if (photoId) {
        const extraParams = {
            caption: `${adText}\nПисать <a href="tg://user?id=${userId}">Сюда</a>`,
            disable_notification: true,
            parse_mode: 'HTML'
        }
        response = await ctx.telegram.sendPhoto(MODERATION_CHAT_ID, photoId, extraParams)
    } else {
        response = await ctx.telegram.sendMessage(
            PUBLICATION_CHANNEL_ID,
            `${adText}\nПисать <a href="tg://user?id=${userId}">Сюда</a>`,
            Extra.HTML());
    }

    let { message_id: publishedMessageId } = response;

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
