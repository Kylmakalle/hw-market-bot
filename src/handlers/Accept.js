const { Extra, Markup } = require('telegraf');
const User = require('../../build/models/User');
import { fetchPhoto } from './PhotoFetcher'

const { MODERATION_CHAT_ID, PUBLICATION_CHANNEL_ID } = process.env;
const allowCallback = async (ctx) => {
    if (!ctx.match) return;

    const [_, userId, userMessageId, reviewMessageId] = ctx.match;
    const { from, text, caption, photo } = ctx.callbackQuery.message;
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
    const fetchedPhoto = photo ? await fetchPhoto(photo[0].file_id) : undefined;

    let response;
    if (photo && fetchedPhoto) {
        const extraParams = {
            caption: `${adText}\nПисать <a href="tg://user?id=${userId}">Сюда</a>`,
            disable_notification: true,
            parse_mode: 'HTML'
        }
        response = await ctx.telegram.sendPhoto(MODERATION_CHAT_ID, fetchedPhoto, extraParams)
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
