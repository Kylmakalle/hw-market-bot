const { Extra, Markup } = require('telegraf');
const denyCallback = async (ctx) => {
    if (!ctx.match || !ctx.callbackQuery) return;

    const [_, userId, userMessageId, reviewMessageId] = ctx.match;
    // const deal = await DealModel.findById(dealId);
    // if (!deal || deal.status !== DealStatus.REVIEW) return; // :DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD

    // const { creator, moderationMessageId } = deal;
    // deal.status = DealStatus.DECLINED;

    // await deal.save();
    await ctx.telegram.sendMessage(userId, `Извини, но твой лот не был одобрен модерацией.\nПричина: -`, {
        reply_to_message_id: userMessageId,
    });

    await ctx.telegram.editMessageReplyMarkup(
        process.env.MODERATION_CHAT_ID,
        reviewMessageId,
        undefined,
        Markup.inlineKeyboard([
            Markup.callbackButton(`Отклонено ${ctx.from.first_name} ${ctx.from.last_name}`, 'dummybutton'),
        ]),
    );

    return ctx.answerCbQuery('Отклоняю');
};

const setupDenyCallback = (bot) => bot.action(/^deny(.+)_(.+)_(.+)$/, denyCallback);

module.exports = { setupDenyCallback };
