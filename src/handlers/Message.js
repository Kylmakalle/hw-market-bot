const { Markup, Extra } = require('telegraf');
const User = require('../models/User');

const { MODERATION_CHAT_ID } = process.env;

const handleMessage = async (ctx) => {
    if (ctx.chat && ctx.chat.type === 'private') {
        // заявка на объявление
        const { from, message_id, caption, text, photo } = ctx.message;
        const actualText = caption || text; // надо еще поддерживать заявки с фотографиями!!!
        //const photo = photo ? photo[0].file_id : undefined;
        // const user = await User.findOrCreate({
        //     id: from.id,
        //     surname: from.last_name,
        //     name: from.first_name,
        //     username: from.username,
        // });
        const user = new User(from);

        const formattedMessage = `\nОт: ${user.getMentionByFullNameHtml()}\nЛот:\n\n${actualText}`;
        const title = text.split('\n')[0].slice(0, 15);
        // const deal = await DealModel.create({
        //     creator: user,
        //     media: photo,
        //     title,
        //     description: text,
        //     status: DealStatus.REVIEW,
        // });

        const { message_id: reviewMessageId } = await ctx.telegram.sendMessage(
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
        const infoString = `${from.id}_${message_id}_${reviewMessageId}`;

        await ctx.telegram.editMessageReplyMarkup(
            MODERATION_CHAT_ID,
            reviewMessageId,
            undefined,
            Markup.inlineKeyboard([
                Markup.callbackButton('Добро', `allow${infoString}`),
                Markup.callbackButton('Говно', `deny${infoString}`),
            ]),
        );

        // deal.moderationMessageId = moderatorsChatMessage.message_id;
        // await deal.save();

        // user.deals.push(deal);
        // await user.save();

        return ctx.reply('Принято к рассмотрению');
    } else if (ctx.chat && ctx.chat.id === MODERATION_CHAT_ID) {
        // модераторы рофлят

        const message = ctx.message;
        const { text, reply_to_message: replyTo, from } = message;
        if (!replyTo || !replyTo.reply_markup) return; // Какой-то поехавший модер спамит в чат без ответа

        // const deal = await DealModel.findOne({ moderationMessageId: replyTo.message_id });
        // if (!deal || deal.status !== DealStatus.REVIEW) return; // :DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD

        // const { creator } = deal;
        // deal.status = DealStatus.DECLINED;
        debugger;
        const { inline_keyboard } = replyTo.reply_markup;
        const [firstLine] = inline_keyboard;
        const [allowButton] = firstLine;
        const [_, userId, userMessageId, reviewMessageId] = allowButton.callback_data.match(/^allow(.+)_(.+)_(.+)$/);

        // await deal.save();
        await ctx.telegram.sendMessage(userId, `Извини, но твой лот не был одобрен модерацией.\nПричина: ${text}`, {
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
    }
};

module.exports = { handleMessage };
