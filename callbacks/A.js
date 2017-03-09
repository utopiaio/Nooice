module.exports = (config, bot, callbackQuery) => {
  const data = JSON.parse(callbackQuery.data);

  bot.sendChatAction(callbackQuery.message.chat.id, 'typing');

  const inlineKeyboard = config.BANKS.map((bank, index) => [{ text: bank, callback_data: JSON.stringify({ type: 'B', i: index, l: data.l }) }]);

  bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', false);
  bot.sendMessage(callbackQuery.message.chat.id, 'የማን ነው?', {
    reply_to_message_id: callbackQuery.message.reply_to_message.message_id,
    reply_markup: JSON.stringify({
      inline_keyboard: inlineKeyboard,
    }),
  });
};
