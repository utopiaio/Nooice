/* eslint no-console: 0 */

module.exports = (bot, config, moedoo) => (callbackQuery) => {
  console.log(callbackQuery, moedoo);

  const data = JSON.parse(callbackQuery.data);

  switch (data.type) {
    case 'N':
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', true);
      return;

    case 'S':
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', false);
      return;

    case 'A':
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE!', false);
      bot.sendDocument(callbackQuery.message.chat.id, config.GIF);
      return;

    default:
      bot.answerCallbackQuery(callbackQuery.id, 'NOOICE?', false);
  }
};
