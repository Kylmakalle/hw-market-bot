import { Markup, Extra } from 'telegraf';
import { User } from '../models/User';

const { MODERATION_CHAT_ID } = process.env;

const handleMessage = async (ctx) => {
    if (ctx.chat && ctx.chat.id == MODERATION_CHAT_ID) {
        const message = ctx.message;
        const { text, caption, reply_to_message: replyTo, from } = message;
        console.log(message)
        if (!replyTo || !replyTo.reply_markup) return; // Какой-то поехавший модер спамит в чат без ответа

        const { inline_keyboard } = replyTo.reply_markup;
        const [firstLine] = inline_keyboard;
        const [allowButton] = firstLine;
        const [_, userId, userMessageId, reviewMessageId] = allowButton.callback_data.match(/^allow(.+)_(.+)_(.+)$/);

        await ctx.telegram.sendMessage(userId, `Извини, но твой лот не был одобрен модерацией.\nПричина: ${caption || text}`, {
            reply_to_message: userMessageId,
        });

        await ctx.telegram.editMessageReplyMarkup(
            MODERATION_CHAT_ID,
            replyTo.message_id,
            undefined,
            Markup.inlineKeyboard([
                Markup.callbackButton(`Отклонено ${from.first_name} ${from.last_name}. Причина: ${text}`, 'dummybutton'),
            ]),
        );
    } else if (ctx.chat && ctx.chat.type === 'private') {
        const { from, message_id, caption, text, photo } = ctx.message;
        const actualText = caption || text;
        const user = new User(from);
        const photoId = photo ? photo[0].file_id : undefined;
        const formattedMessage = `\nОт: ${user.getMentionByFullNameHtml()}\nЛот:\n\n${actualText}`;
        // no title for now
        // const title = actualText.split('\n')[0].slice(0, 15)

        let response;
        if (photoId) {
            const extraParams = {
                caption: formattedMessage,
                parse_mode: 'HTML'
            }
            response = await ctx.telegram.sendPhoto(MODERATION_CHAT_ID, photoId, extraParams)
        } else {
            response = await ctx.telegram.sendMessage(
                MODERATION_CHAT_ID,
                formattedMessage,
                Extra.HTML(),
                // Extra.HTML().markup((m: Markup) => {
                //     return m.inlineKeyboard(
                //         [m.callbackButton('Добро', `allow${from.id}_`), m.callbackButton('Говно', `deny${deal.id}`)],
                //         {},
                //     );
                // }),
            );
        }
        let { message_id: reviewMessageId } = response;
        const infoString = `${from.id}_${message_id}_${reviewMessageId}`;
        console.log(infoString)

        await ctx.telegram.editMessageReplyMarkup(
            MODERATION_CHAT_ID,
            reviewMessageId,
            undefined,
            Markup.inlineKeyboard([
                Markup.callbackButton('Добро', `allow${infoString}`),
                Markup.callbackButton('Говно', `deny${infoString}`),
            ]),
        );

        return ctx.reply('Принято к рассмотрению');
    }
};

module.exports = { handleMessage };
